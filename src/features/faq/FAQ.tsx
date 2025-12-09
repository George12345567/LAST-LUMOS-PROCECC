import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What industries do you work with?",
      answer:
        "We work with businesses across all industries—restaurants, retail stores, factories, real estate, healthcare, and more. Our solutions are tailored to meet the unique needs of each sector.",
    },
    {
      question: "How much does a typical project cost?",
      answer:
        "Project costs vary based on scope, complexity, and requirements. We offer flexible packages and custom quotes. Contact us for a free consultation and personalized pricing.",
    },
    {
      question: "How long does it take to complete a website?",
      answer:
        "A standard website typically takes 2-4 weeks from discovery to launch. More complex systems or custom features may take 6-8 weeks. We'll provide a detailed timeline during our strategy phase.",
    },
    {
      question: "Do you provide ongoing support after launch?",
      answer:
        "Yes! We offer 24/7 support and maintenance packages to ensure your digital assets run smoothly. This includes updates, security monitoring, and technical assistance.",
    },
    {
      question: "Can you help with social media management?",
      answer:
        "Absolutely! We offer comprehensive social media management services including content creation, posting schedules, audience engagement, and performance analytics across all major platforms.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 text-foreground reveal">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <p className="text-center text-muted-foreground mb-10 sm:mb-12 md:mb-16 text-sm sm:text-base lg:text-lg reveal">
          Got questions? We've got answers
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="reveal glass-card rounded-xl overflow-hidden border border-border hover-lift"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
              >
                <span className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <span className="flex-shrink-0 text-primary">
                  {openIndex === index ? <Minus size={24} /> : <Plus size={24} />}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-muted-foreground">
                  {faq.answer}
                </div>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent shimmer-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

