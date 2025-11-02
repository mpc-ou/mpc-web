"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOME_SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FAQSectionProps {
  className?: string;
}

export function FAQSection({ className }: FAQSectionProps) {
  const faq = HOME_SECTIONS.faq;

  return (
    <section className={cn("py-20 bg-[var(--bg-secondary)]", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[var(--text-primary)] border-b-2 border-[var(--primary)] pb-2 inline-block">
              {faq.title}
            </h2>
            {faq.description && (
              <p className="text-center text-base md:text-lg text-[var(--text-secondary)] mt-4">
                {faq.description}
              </p>
            )}
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faq.items.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border border-[var(--border)] rounded-lg bg-[var(--card)] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden data-[state=open]:shadow-lg data-[state=open]:border-[var(--primary)]/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5 md:py-6 px-5 md:px-6 hover:bg-[var(--muted)]/50 transition-colors duration-200">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="text-base md:text-lg text-[var(--text-primary)] font-medium">
                      <span className="text-[var(--primary)] mr-2 font-semibold">
                        {idx + 1}.
                      </span>
                      {item.q}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg text-[var(--text-secondary)] pb-5 md:pb-6 pt-0 px-5 md:px-6 pl-7 md:pl-8 leading-relaxed transition-all duration-300 ease-in-out">
                  <div className="border-t border-[var(--border)]/50 pt-4 mt-2">
                    {item.a}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

