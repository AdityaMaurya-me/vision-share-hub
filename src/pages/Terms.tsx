import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Terms of Service — VisionX</title>
      <meta name="description" content="The terms that govern your use of VisionX." />
      <link rel="canonical" href="/terms" />
    </Helmet>
    <Navbar />
    <main className="container max-w-3xl pt-28 pb-20 prose prose-invert prose-sm">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: today</p>

      <h2>1. Who can use VisionX</h2>
      <p>You must be at least 13 years old and able to form a binding contract to create an account.</p>

      <h2>2. Your content</h2>
      <p>You retain ownership of the photos, captions, and gear data you upload. By posting, you grant VisionX a worldwide, non-exclusive license to host, display, and resize your content so the service can function.</p>

      <h2>3. Acceptable use</h2>
      <p>Do not upload content you do not have rights to, content that is illegal, hateful, sexually explicit, or that infringes on someone's privacy. We may remove content and suspend accounts that violate these rules.</p>

      <h2>4. Gear catalog</h2>
      <p>Gear pages are community-edited. Prices and retailer links are user-submitted and may be inaccurate. VisionX is not responsible for purchases made through outbound links.</p>

      <h2>5. Termination</h2>
      <p>You may delete your account at any time from Settings. We may suspend accounts that breach these terms.</p>

      <h2>6. Disclaimer</h2>
      <p>The service is provided "as is" without warranties of any kind.</p>

      <h2>7. Contact</h2>
      <p>Questions? Reach us through the Help page.</p>
    </main>
  </div>
);

export default Terms;
