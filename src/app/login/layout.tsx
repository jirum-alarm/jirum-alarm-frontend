import NavBar from '../../components/Navbar'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar></NavBar>
      {children}
    </>
  )
}
