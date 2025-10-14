// src/components/HtmlBlock.jsx
import DOMPurify from "dompurify";

export default function HtmlBlock({ html = "" }) {
  if (!html) return null;

  // Sửa các URL ảnh dạng //... thành https://...
  const fixed = html.replace(/src=["']\/\/([^"']+)["']/g, 'src="https://$1"');

  const clean = DOMPurify.sanitize(fixed, {
    // Cho phép một số thuộc tính/thẻ hay dùng
    ADD_ATTR: ["style", "class", "data-src", "width", "height"],
    ADD_TAGS: ["img", "figure", "figcaption"],
  });

  return (
    <div
      className="prose max-w-none"
      // Lưu ý: chỉ dùng khi đã sanitize!
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
