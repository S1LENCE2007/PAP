import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import BarberLayout from './components/layout/BarberLayout';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyAppointments from './pages/MyAppointments';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Reviews from './pages/Reviews';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminManage from './pages/admin/Manage';
import CreateUser from './pages/admin/CreateUser';
import AdminProducts from './pages/admin/Products';
import AdminGallery from './pages/admin/Gallery';
import AdminServices from './pages/admin/Services';
import AdminMessages from './pages/admin/Messages';
import BarberDashboard from './pages/barber/Dashboard';
import BarberAppointments from './pages/barber/Appointments';
import MyOrders from './pages/MyOrders';
import VerifyOrder from './pages/admin/VerifyOrder';

import { Toaster } from 'react-hot-toast';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#18181b', // zinc-900
                color: '#fff',
                border: '1px solid #27272a', // zinc-800
              },
              success: {
                iconTheme: {
                  primary: '#d4af37', // primary color
                  secondary: '#000',
                },
              },
            }}
          />
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
                <Route path="/minhas-marcacoes" element={<MyAppointments />} />
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
                <Route path="marcações" element={<AdminAppointments />} />
                <Route path="gerenciar" element={<AdminManage />} />
                <Route path="criar-utilizador" element={<CreateUser />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="galeria" element={<AdminGallery />} />
                <Route path="servicos" element={<AdminServices />} />
                <Route path="mensagens" element={<AdminMessages />} />
              </Route>

              {/* Barber Routes */}
              <Route path="/barbeiro" element={<BarberLayout />}>
                <Route index element={<BarberDashboard />} />
                <Route path="marcações" element={<BarberAppointments />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
