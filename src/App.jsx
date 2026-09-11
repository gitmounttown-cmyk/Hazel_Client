import AppRoutes from './routes/AppRoutes';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId =  import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  // return (
  //   <Router>
  //     <Navbar />
     
  //     <Routes>
  //       <Route path="/" element={<Hero />} />
  //       <Route path="/shop" element={<Shop />} />
  //     </Routes>
  //      <ShopByCategory/>
  //      <TrendingProducts/>
  //      <FestivalBanner/>
  //      <NewArrivals/>
  //   </Router>
    
  // );

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppRoutes />
    </GoogleOAuthProvider>
  );
}

export default App;