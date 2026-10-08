import { ArrowUpRight } from 'lucide-react';

export function GitHubLink() {
  return <a className="github-link" href="https://github.com/luisleineweber/unpurify" target="_blank" rel="noreferrer">
    <img src={`${import.meta.env.BASE_URL}assets/github-mark.svg`} alt="" width="20" height="20" />
    <span>GitHub</span>
    <ArrowUpRight size={14} aria-hidden="true" />
  </a>;
}
