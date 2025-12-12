import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: "80vh" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
