import { OrderProvider } from "../context/OrderContext";
import { Header } from "./organisms/Header.client";
import { HomeSection } from "./organisms/HomeSection.client";
import { MenuSection } from "./organisms/MenuSection.client";
import { HoursSection } from "./organisms/HoursSection.client";
import { ContactSection } from "./organisms/ContactSection.client";
import { OrderManager } from "./organisms/order/OrderManager.client";

export const App = () => {
  return (
    <OrderProvider>
      <Header />
      <HomeSection id="home-section" />
      <MenuSection id="menu-section" />
      <HoursSection id="hours-section" />
      <ContactSection id="contact-section" />
      <OrderManager />
    </OrderProvider>
  );
};
