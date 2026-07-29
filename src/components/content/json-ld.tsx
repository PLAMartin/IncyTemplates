/**
 * Renders a structured-data object as a `<script type="application/ld+json">`
 * tag. `data` is always server-built from our own builders in
 * `src/lib/seo/structured-data.ts`, never raw user input.
 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
