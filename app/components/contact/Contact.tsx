import type { CSSProperties } from "react";
import { CONTACT } from "../../lib/data";
import Lines from "../motion/Lines";
import Icon from "../ui/Icon";
import "./contact.css";

const handle = (url: string) => url.replace(/\/$/, "").split("/").pop() ?? url;

interface Row {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

const ROWS: Row[] = [
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
  { label: "GitHub", value: handle(CONTACT.github), href: CONTACT.github, external: true },
  { label: "LinkedIn", value: "ashutosh--joshi", href: CONTACT.linkedin, external: true },
  { label: "One page, PDF", value: "Résumé", href: CONTACT.resume, external: true },
  { label: "US Eastern time", value: "Baltimore, Maryland" },
];

/* Every way to reach me, one per row at heading size, then the ask. */
export default function Contact() {
  return (
    <section id="contact" className="contact" data-theme="night" aria-labelledby="contact-title">
      <Lines id="contact-title" className="contact__title t-head wrap" lines={["Let’s talk"]} />

      <ul className="contact__rows">
        {ROWS.map((row, i) => {
          const style = { "--d": `${i * 70}ms` } as CSSProperties;
          const body = (
            <>
              <span className="contact__value t-head">{row.value}</span>
              <span className="contact__label t-small">
                {row.label}
                {row.href && <Icon name={row.external ? "arrow-up-right" : "arrow-right"} className="contact__arrow" />}
              </span>
            </>
          );
          return (
            <li key={row.label} className="contact__item" data-rise style={style}>
              {row.href ? (
                <a
                  className="contact__row wrap"
                  href={row.href}
                  {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {body}
                </a>
              ) : (
                <p className="contact__row wrap">{body}</p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="contact__band wrap">
        <p className="contact__ask t-lead">
          Open to roles in LLM inference, ML platforms and GPU systems.
        </p>
        <a className="button button--ink" href={`mailto:${CONTACT.email}`}>
          Email Ashutosh
          <Icon name="arrow-right" className="button__arrow" />
        </a>
      </div>
    </section>
  );
}
