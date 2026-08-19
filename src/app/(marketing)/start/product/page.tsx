import { redirect } from "next/navigation";

/**
 * Spec v9 §7.1: `/start/product` and `/collections/start-a-product` may resolve to the same
 * experience — use one canonical URL and redirect the other. `/collections/[slug]` is canonical
 * (it generalises to future collections without a code change); this is the friendlier alias
 * the homepage/nav "Start here" copy suggests.
 */
export default function StartProductRedirect() {
  redirect("/collections/start-a-product");
}
