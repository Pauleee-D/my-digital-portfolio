"use client"

import { useEffect, useRef } from "react"
import DOMPurify from "dompurify"

interface BlogContentProps {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      // Sanitize the HTML content on the client side
      const sanitizedContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
          'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
        ALLOW_DATA_ATTR: false
      })
      contentRef.current.innerHTML = sanitizedContent
    }
  }, [content])

  return (
    <div
      ref={contentRef}
      className="mt-8 prose prose-gray dark:prose-invert max-w-none"
    />
  )
}