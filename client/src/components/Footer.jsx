export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 py-6 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} HomeFinder · Built with the MERN stack
    </footer>
  );
}