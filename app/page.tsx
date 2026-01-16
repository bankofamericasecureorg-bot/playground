import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to user login page as there's no landing page
  redirect('/user/login');
}
