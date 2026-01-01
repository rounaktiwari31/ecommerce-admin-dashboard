import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";
import Link from "next/link";

const ProductChart = dynamic(
  () => import("@/components/ProductChart"),
  { ssr: false }
);

export default async function Dashboard() {
  const cookieStore = await cookies();
  const admin = cookieStore.get("admin");

  if (!admin || admin.value !== "true") {
    redirect("/login");
  }

  let products: { name: string; price: number }[] = [];

  try {
    const rawProducts = await prisma.product.findMany();

    products = rawProducts.map((p) => ({
      name: p.name,
      price: Number(p.price ?? 0),
    }));
  } catch (err) {
    console.error("DASHBOARD FETCH ERROR:", err);
  }

  const totalProducts = products.length;

  const averagePrice =
    totalProducts === 0
      ? "0.00"
      : (
          products.reduce((sum, p) => sum + p.price, 0) /
          totalProducts
        ).toFixed(2);

  const highestPrice =
    totalProducts === 0
      ? 0
      : Math.max(...products.map((p) => p.price));

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: "1rem" }}>
        <p><strong>Total Products:</strong> {totalProducts}</p>
        <p><strong>Average Price:</strong> ₹{averagePrice}</p>
        <p><strong>Highest Price:</strong> ₹{highestPrice}</p>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/dashboard/products"
          prefetch={false}
          style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            border: "1px solid #6366f1",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Manage Products →
        </Link>
      </div>

      <div
        style={{
          padding: "1rem",
          border: "1px solid #333",
          borderRadius: "8px",
        }}
      >
        <ProductChart products={products} />
      </div>
    </div>
  );
}