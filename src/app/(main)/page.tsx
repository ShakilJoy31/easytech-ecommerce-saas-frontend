// app/(public)/page.tsx
import PublicHomePage from "@/components/home/PublicHomePage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Discover Amazing Products | StoreForge",
    description:
      "Shop the latest trends from top-rated stores. Electronics, fashion, home goods and more.",
    keywords: [
      "online shopping",
      "ecommerce",
      "buy online",
      "stores",
      "products",
    ],
  });
}

const Home = () => {
  return (
    <section className="mt-16" >
      <PublicHomePage />
    </section>
  );
};

export default Home;