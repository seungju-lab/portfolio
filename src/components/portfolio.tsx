import { SectionNavigation } from "@/components/section-navigation";
import { CursorGlow } from "@/components/cursor-glow";
import { PointerInteractions } from "@/components/pointer-interactions";
import type { ReactNode } from "react";
import type { ProjectSummary } from "@/content/portfolio";

type IconName = "arrow" | "external" | "back" | "github" | "print";

export function Icon({ name }: { name: IconName }) {
  // Lucide 0.468.0: see lucide-LICENSE.txt for upstream attribution.
  const paths: Record<IconName, ReactNode> = {
    github: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    external: <path d="M6 18 18 6M6 6h12v12" />,
    back: <path d="M20 12H4m6-6-6 6 6 6" />,
    print: (
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
      </>
    ),
  };
  return (
    <svg
      className={`icon icon-${name}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function PortfolioShell({
  identity,
  children,
  variant = "home",
}: {
  identity: ReactNode;
  children: ReactNode;
  variant?: "home" | "project";
}) {
  return (
    <div className={`portfolio-shell portfolio-shell-${variant}`}>
      <PointerInteractions />
      <CursorGlow />
      <SectionNavigation />
      <header className="portfolio-identity">{identity}</header>
      <main className="portfolio-main" id="main-content">
        {children}
      </main>
    </div>
  );
}
export function Profile({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: ReactNode;
}) {
  return (
    <div className="profile">
      <h1 className="profile-name">{name}</h1>
      <p className="profile-role" lang="en">
        {role}
      </p>
      <p className="profile-intro">{children}</p>
    </div>
  );
}
export function SectionLink({
  href,
  current = false,
  children,
}: {
  href: string;
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      className="section-link"
      href={href}
      aria-current={current ? "location" : undefined}
    >
      <span className="section-link-line" aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
}
export function TextLink({
  href,
  external = false,
  icon = external ? "external" : "arrow",
  children,
}: {
  href: string;
  external?: boolean;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <a
      className="text-link"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {(icon === "github" || icon === "print" || icon === "back") && (
        <Icon name={icon} />
      )}
      <span>{children}</span>
      {icon !== "github" && icon !== "print" && icon !== "back" && (
        <Icon name={icon} />
      )}
      {external && <span className="visually-hidden"> (새 탭)</span>}
    </a>
  );
}
export function SkillTag({ children }: { children: ReactNode }) {
  return (
    <span className="skill-tag" lang="en">
      {children}
    </span>
  );
}
export function ProjectEntry({ project }: { project: ProjectSummary }) {
  return (
    <a
      className="project-entry"
      href={`/projects/${project.slug}/`}
      aria-labelledby={`project-title-${project.slug} project-action-${project.slug}`}
    >
      <span className="entry-date">{project.period}</span>
      <div>
        <h3
          className="entry-title"
          id={`project-title-${project.slug}`}
          lang="en"
        >
          {project.title}
          <Icon name="arrow" />
        </h3>
        <p className="entry-role">{project.role}</p>
        <p className="entry-description">{project.summary}</p>
        <ul className="skill-list" aria-label="사용 기술">
          {project.technologies.map((technology) => (
            <li key={technology}>
              <SkillTag>{technology}</SkillTag>
            </li>
          ))}
        </ul>
        <span className="entry-read-more" id={`project-action-${project.slug}`}>
          상세 읽기
          <Icon name="arrow" />
        </span>
      </div>
    </a>
  );
}
export function EducationEntry({
  period,
  title,
  children,
}: {
  period: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="education-entry">
      <span className="entry-date">{period}</span>
      <div>
        <h3 className="entry-title">{title}</h3>
        <p className="entry-description">{children}</p>
      </div>
    </div>
  );
}
export function ArticleSection({
  id,
  headingId,
  title,
  children,
}: {
  id?: string;
  headingId?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="article-section" id={id}>
      <h2 id={headingId} tabIndex={headingId ? -1 : undefined}>
        {title}
      </h2>
      {children}
    </section>
  );
}
