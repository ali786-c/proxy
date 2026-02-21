interface FAQSectionProps {
  items: { question: string; answer: string }[];
}

export function FAQSection({ items }: FAQSectionProps) {
  return (
    <section className="border-t py-12">
      <div className="container">
        <h2 className="mb-8 text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-3xl space-y-6">
          {items.map((item) => (
            <details key={item.question} className="group rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold">{item.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
