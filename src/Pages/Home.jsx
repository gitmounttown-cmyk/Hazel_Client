import Hero from "../components/Hero/Hero";
import ShopByCategory from "../components/ShopByCategory/ShopByCategory";
import TrendingProducts from "../components/TrendingProducts/TrendingProducts";
import FestivalBanner from "../components/FestivalBanner/FestivalBanner";
import NewArrivals from "../components/NewArrivals/NewArrivals";
import Videos from "../Components/Videos/Videos";
import DailyUsageBanner from "../Components/DailyUsageBanner/DailyUsageBanner";

const Home = () => {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <Videos/>
      <TrendingProducts />
      <DailyUsageBanner />
      <NewArrivals />
      <FestivalBanner />
      
      
      
    </>
  );
};

export default Home;