import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How do I upload a photo?", a: "Head to your profile and click the Upload button. Add gear and tags so others can discover your shot." },
  { q: "What is the Vibe Matcher?", a: "Pick the moods you want to capture and we'll surface community photos and gear that match." },
  { q: "How do collections work?", a: "Open a saved photo's three-dot menu and add it to a collection. Create as many as you like." },
  { q: "Can I delete a photo I uploaded?", a: "Yes — open My Profile, hover the photo, and use the trash icon. Deleting removes it from the entire site." },
  { q: "How do I reset my search?", a: "On Explore, clear the search bar and the results will reset. Your recent searches stay until you remove them." },
];

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl pt-24 pb-16">
        <BackButton />
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="mt-2 text-muted-foreground">Quick answers to common questions.</p>

        <Accordion type="single" collapsible className="mt-8 rounded-xl border border-border bg-card px-4">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Still stuck? Email us at <a href="mailto:hello@visionx.app" className="text-primary hover:underline">hello@visionx.app</a>
        </p>
      </main>
    </div>
  );
};

export default Help;
