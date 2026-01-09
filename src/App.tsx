import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Reviews from './pages/Reviews';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminManage from './pages/admin/Manage';
import CreateBarber from './pages/admin/CreateBarber';
import AdminProducts from './pages/admin/Products';
import AdminGallery from './pages/admin/Gallery';
import AdminServices from './pages/admin/Services';
import BarberDashboard from './pages/barber/Dashboard';
import MyOrders from './pages/MyOrders';
import VerifyOrder from './pages/admin/VerifyOrder';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Routes>
            {/* All Routes Wrapped in MainLayout for Unified Look */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/galeria" element={<Gallery />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registo" element={<Register />} />
              <Route path="/loja" element={<Shop />} />
              <Route path="/loja/carrinho" element={<Cart />} />
              <Route path="/avaliacoes" element={<Reviews />} />

              {/* Protected Client Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/agendar" element={<Booking />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/barbeiro" element={<BarberDashboard />} />
                <Route path="/minhas-encomendas" element={<MyOrders />} />
              </Route>

              {/* Admin Routes - Now Integrated with MainLayout below */}

              <Route path="/verificar-encomenda" element={
                <ProtectedRoute allowedRoles={['admin', 'barbeiro']}>
                  <VerifyOrder />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="agendamentos" element={<AdminAppointments />} />
                <Route path="gerenciar" element={<AdminManage />} />
                <Route path="criar-barbeiro" element={<CreateBarber />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="galeria" element={<AdminGallery />} />
                <Route path="servicos" element={<AdminServices />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
