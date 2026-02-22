import { NextResponse } from "next/server";

export const revalidate = 86400; // cache for 24 hours

interface GoogleReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: { text: string };
  authorAttribution: {
    displayName: string;
    uri: string;
    photoUri: string;
  };
}

interface GooglePlaceResponse {
  reviews?: GoogleReview[];
  rating?: number;
  userRatingCount?: number;
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: "Missing API key or Place ID" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription,rating,userRatingCount",
        },
        next: { revalidate: 86400 }, // re-fetch once per day
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Google Places API error:", err);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: res.status }
      );
    }

    const data: GooglePlaceResponse = await res.json();

    const reviews = (data.reviews ?? [])
      .filter((r) => r.rating === 5) // only show 5-star reviews
      .map((r) => ({
      name: r.authorAttribution?.displayName ?? "Guest",
      date: r.relativePublishTimeDescription ?? "",
      rating: r.rating ?? 5,
      text: r.text?.text ?? "",
      photoUrl: r.authorAttribution?.photoUri ?? null,
      profileUrl: r.authorAttribution?.uri ?? null,
      source: "google" as const,
    }));

    return NextResponse.json({
      reviews,
      overallRating: data.rating ?? null,
      totalReviews: data.userRatingCount ?? null,
    });
  } catch (err) {
    console.error("Error fetching Google reviews:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
