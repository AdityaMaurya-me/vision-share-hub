import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Privacy Policy — VisionX</title>
      <meta name="description" content="How VisionX collects, uses, and protects your data." />
      <link rel="canonical" href="/privacy" />
    </Helmet>
    <Navbar />
    <main className="container max-w-3xl pt-28 pb-20 prose prose-invert prose-sm">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: today</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data</strong> — email, username, optional avatar and bio.</li>
        <li><strong>Content</strong> — photos you upload and any metadata you attach (gear, ISO, aperture, tags).</li>
        <li><strong>Activity</strong> — saves, follows, kit items, and the basic logs needed to operate the service.</li>
      </ul>

      <h2>How we use it</h2>
      <p>To run the platform: authenticate you, show your shots in feeds, power search, and let other photographers discover gear. We don't sell your personal data.</p>

      <h2>Cookies</h2>
      <p>We use a small number of first-party cookies and local storage entries to keep you signed in.</p>

      <h2>Your rights</h2>
      <p>You can edit your profile, delete uploads, and delete your account from Settings. Account deletion removes your profile and content from public view.</p>

      <h2>Contact</h2>
      <p>For privacy questions, contact us via the Help page.</p>
    </main>
  </div>
);

export default Privacy;
