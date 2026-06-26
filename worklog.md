# Kalakriti Academy - Worklog

## Task 2: Seed API Route

**Date:** 2025-01-XX
**File created:** `src/app/api/seed/route.ts`

### Summary
Created the `POST /api/seed` API route that idempotently seeds the SQLite database with sample data for the Kalakriti Academy platform.

### What was built
- **Endpoint:** `POST /api/seed`
- **Behavior:** Clears all existing data (respecting FK constraints) and reseeds with sample data. Returns counts of all created records.
- **Error handling:** Returns `500` with error message on failure.

### Seed data included
| Model | Count | Details |
|-------|-------|---------|
| Categories | 6 | Painting & Drawing, Digital Art, Traditional Art, Calligraphy, Photography, Crafts & Sculpture |
| Products | 8 | Full course listings with pricing, ratings, instructor info, featured/bestseller flags |
| Chapters | ~39 | 5-6 chapters per product with titles and ordering |
| Lessons | ~166 | 3-6 lessons per chapter with titles and durations |
| Users | 1 | Demo user (demo@kalakriti.com) |
| Coupons | 1 | KALAKRITI20 - 20% off, min ₹999, 100 max uses |
| Reviews | 29 | 3-4 realistic reviews per product with varied 4-5 star ratings |

### Technical notes
- Uses Prisma `db` from `@/lib/db`
- Nested creates for chapters and lessons within products (efficient single-pass creation)
- Delete order follows FK dependency chain: reviews → enrollments → orderItems → orders → cartItems → chapters (cascade deletes lessons) → products → coupons → users → categories
- First chapter of each product is marked `isFree: true`
- Coupon expires 90 days from seed time