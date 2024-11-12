import { Link } from "@inertiajs/react";

export default function Pagination({ links, queryParams }) {
  return (
    <nav className="text-center mt-4">
      {links.map((link) => {
        // Skip if link.url is not valid
        if (!link.url) return null;

        // Create a new URL object for each link's URL
        const pageUrl = new URL(link.url);

        // Add queryParams to the URL, except for `page`
        Object.keys(queryParams).forEach((key) => {
          if (key !== "page") {  // Prevent duplicate `page` query parameter
            pageUrl.searchParams.set(key, queryParams[key]);
          }
        });

        return (
          <Link
            preserveScroll
            href={pageUrl.toString()}
            key={link.label}
            className={
              "inline-block py-2 px-3 rounded-lg text-gray-200 text-xs " +
              (link.active ? "bg-gray-950 " : " ") +
              (!link.url
                ? "!text-gray-500 cursor-not-allowed "
                : "hover:bg-gray-950")
            }
            dangerouslySetInnerHTML={{ __html: link.label }}
          ></Link>
        );
      })}
    </nav>
  );
}
