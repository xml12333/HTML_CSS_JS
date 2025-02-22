// Define the global LR namespace if not already defined
const LR = window.LR || {};

// Add a utils object inside LR for modular utilities
LR.utils = LR.utils || {};

// Add the urlUtils module inside LR.utils
LR.utils.urlUtils = (function() {
    /**
     * Private helper to sanitize a node.
     * @param {Node} node - The DOM node to sanitize.
     * @returns {string} - Sanitized HTML or text content.
     */
    function sanitizeNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Escape text content only
            return node.nodeValue
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recurse for child nodes
            const clonedNode = node.cloneNode(false);
            Array.from(node.childNodes).forEach((child) => {
                clonedNode.appendChild(
                    document.createRange().createContextualFragment(sanitizeNode(child))
                );
            });
            return clonedNode.outerHTML;
        }
        return "";
    }

    /**
     * Public methods exposed by the urlUtils module.
     */
    return {
        /**
         * Checks if a given URL points to the same page as the current iframe or matches configured host domains.
         * @param {string} url_ - The URL to check.
         * @param {Array<string>} hostDomains - Additional host domains to treat as "same origin."
         * @returns {boolean} - True if the URL matches the current iframe page or is explicitly trusted.
         */
        isSamePage: function(url_, hostDomains = []) {
            try {
                const parsedUrl = new URL(url_, window.location.href);

                const isIframeHost =
                    parsedUrl.hostname === window.location.hostname &&
                    parsedUrl.pathname === window.location.pathname;

                const isHostDomain = hostDomains.includes(parsedUrl.hostname);

                return isIframeHost || isHostDomain;
            } catch (e) {
                console.warn("Invalid URL provided:", url_);
                return false;
            }
        },

        /**
         * Configures a URL with appropriate attributes for security.
         * @param {string} url_ - The URL to configure.
         * @param {Array<string>} hostDomains - Additional host domains to treat as "same origin."
         * @returns {Object} - An object containing the updated URL and attributes.
         */
        configureUrl: function(url_, hostDomains = []) {
            const isSamePage = this.isSamePage(url_, hostDomains);

            const result = {
                href: url_
            };

            if (isSamePage) {
                if (window.top !== window.self) {
                    result.target = "_top";
                } else {
                    result.target = "_self";
                }
            } else {
                result.target = "_blank";
                result.rel = "noopener noreferrer";
            }

            return result;
        },

        /**
         * Validates and updates the attributes of a collection of links.
         * @param {HTMLCollection} links - The links to validate.
         * @param {Array<string>} hostDomains - Additional host domains to treat as "same origin."
         */
        validateLinks: function(links, hostDomains = []) {
            for (let i = 0; i < links.length; i++) {
                const link = links[i];

                // Skip anchor links that start with "#"
                if (link.getAttribute("href").startsWith("#")) {
                    continue;
                }

                // Skip if the link already has a target or rel attribute
                if (link.hasAttribute("target") || link.hasAttribute("rel")) {
                    continue;
                }

                // Sanitize the inner HTML of the link
                link.innerHTML = this.escapeHtml(link.innerHTML);

                const linkConfig = this.configureUrl(link.href, hostDomains);

                link.setAttribute("href", linkConfig.href);

                if (linkConfig.target === "_self") {
                    link.addEventListener("click", function(event) {
                        event.preventDefault();
                        window.location.href = link.href;
                    });
                } else {
                    link.setAttribute("target", linkConfig.target);
                    if (linkConfig.rel) {
                        link.setAttribute("rel", linkConfig.rel);
                    } else {
                        link.removeAttribute("rel");
                    }
                }
            }
        },

        /**
         * Escapes HTML content to prevent XSS and injection attacks.
         * @param {string} unsafe_ - The unsafe HTML to escape.
         * @returns {string} - Escaped HTML.
         */
        escapeHtml: function(unsafe_) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = unsafe_;

            return Array.from(tempDiv.childNodes).map(sanitizeNode).join("");
        }
    };
})();
