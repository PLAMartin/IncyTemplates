"use client";

import { useEffect, type RefObject } from "react";
import type { FinderFrameworkOption, FinderRecommendation, FinderResult } from "@/lib/finder";
import type { ProductSummary } from "@/types/catalogue";
import { ProductCard } from "@/components/catalogue/product-card";

function findProduct(
  recommendation: FinderRecommendation,
  frameworkOptions: FinderFrameworkOption[],
  outputsByFramework: ProductSummary[],
): ProductSummary | null {
  const framework = frameworkOptions.find((f) => f.slug === recommendation.frameworkSlug);
  if (!framework) return null;
  return (
    outputsByFramework.find((p) => p.framework_id === framework.id && p.product_type === recommendation.outputType) ?? null
  );
}

function RecommendationCard({
  recommendation,
  frameworkOptions,
  outputsByFramework,
}: {
  recommendation: FinderRecommendation;
  frameworkOptions: FinderFrameworkOption[];
  outputsByFramework: ProductSummary[];
}) {
  const product = findProduct(recommendation, frameworkOptions, outputsByFramework);
  if (!product) return null;

  return (
    <div>
      <p className="text-sm text-ink-700">{recommendation.reason}</p>
      <div className="mt-3">
        <ProductCard product={product} />
      </div>
    </div>
  );
}

/**
 * Result renderer for the Next Step Finder — its own component rather than a reuse of any
 * per-family Tool's result summary, since this one resolves a slug-based `FinderResult`
 * back into real `ProductSummary` objects and renders them with the existing `ProductCard`,
 * rather than a self-contained score. See docs/decisions/0026.
 */
export function FinderResultSummary({
  result,
  frameworkOptions,
  outputsByFramework,
  onRestart,
  headingRef,
}: {
  result: FinderResult;
  frameworkOptions: FinderFrameworkOption[];
  outputsByFramework: ProductSummary[];
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  useEffect(() => {
    // Spec §10.6/§32.4: move focus to the result on completion so screen-reader users get
    // an explicit announcement rather than silence after the last question.
    headingRef.current?.focus();
  }, [headingRef]);

  const primaryProduct = findProduct(result.primary, frameworkOptions, outputsByFramework);

  return (
    <div className="rounded-md border border-ink-200 bg-paper-raised p-6" role="region" aria-label="Your recommendation">
      <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-semibold text-ink-900 outline-none">
        Your recommendation
      </h2>

      {result.isFreeStart ? (
        <span className="mt-3 inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900">
          Free to start
        </span>
      ) : null}

      {primaryProduct ? (
        <div className="mt-4">
          <RecommendationCard recommendation={result.primary} frameworkOptions={frameworkOptions} outputsByFramework={outputsByFramework} />
        </div>
      ) : null}

      {result.supporting.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-ink-900">Next steps after that</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {result.supporting.map((recommendation) => (
              <RecommendationCard
                key={`${recommendation.frameworkSlug}-${recommendation.outputType}`}
                recommendation={recommendation}
                frameworkOptions={frameworkOptions}
                outputsByFramework={outputsByFramework}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          Start again
        </button>
      </div>
    </div>
  );
}
