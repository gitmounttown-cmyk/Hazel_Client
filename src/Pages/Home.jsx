import Hero from "../components/Hero/Hero";
import ShopByCategory from "../components/ShopByCategory/ShopByCategory";
import TrendingProducts from "../components/TrendingProducts/TrendingProducts";
import FestivalBanner from "../components/FestivalBanner/FestivalBanner";
import NewArrivals from "../components/NewArrivals/NewArrivals";
import Videos from "../Components/Videos/Videos";

const Home = () => {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <TrendingProducts />
      <FestivalBanner />
      <NewArrivals />
      <Videos/>
      
    </>
  );
};

export default Home;