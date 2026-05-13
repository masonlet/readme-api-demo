interface ApiErrorResponse {
  error?: string;
}

function setStatus(message: string): void {
  const status = document.getElementById("form-status");
  if (status instanceof HTMLElement) status.innerText = message;
}

function resetOutput(): void {
  const output = document.getElementById("readme-output");
  const content = document.getElementById("readme-content");
  if (content instanceof HTMLElement) content.innerHTML = "";
  if (output instanceof HTMLElement) output.hidden = true;
}

function showOutput(html: string): void {
  const output = document.getElementById("readme-output");
  const content = document.getElementById("readme-content");
  if (!(output instanceof HTMLElement) || !(content instanceof HTMLElement)) return;

  content.innerHTML = html;
  output.hidden = false;
}

function validateInputs(form: HTMLFormElement): { owner: string; repo: string } {
  const data = new FormData(form);

  const owner = data.get("owner")?.toString().trim();
  const repo = data.get("repo")?.toString().trim();
  if (owner && !repo)  throw new Error("Please enter a repository.");
  if (repo && !owner)  throw new Error("Please enter a GitHub username.");
  if (!owner || !repo) throw new Error("Please enter both a GitHub username and repository.");

  return { owner, repo };
}

function buildApiUrl(owner: string, repo: string): string {
  const url = new URL("api/readme", window.location.origin + import.meta.env.BASE_URL);
  url.searchParams.set("owner", owner);
  url.searchParams.set("repo", repo);
  return url.toString();
}

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as ApiErrorResponse;
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  const text = await response.text();
  return text.trim() || `Request failed (${response.status})`;
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  const response = await fetch(buildApiUrl(owner, repo));
  if (!response.ok) throw new Error(await parseError(response));
  return response.text();
}

function initForm(): void {
  const form = document.getElementById("readme-form");

  if (!(form instanceof HTMLFormElement)) throw new Error(
    'Required form element with id "readme-form" not found'
  );

  form.addEventListener("submit", async (event: Event) => {
    event.preventDefault();

    resetOutput();
    setStatus("Loading README...");

    try {
      const { owner, repo } = validateInputs(form);
      const html = await fetchReadme(owner, repo);

      showOutput(html);
      setStatus("README loaded successfully.");
    } catch (error: unknown) {
      resetOutput();
      setStatus(error instanceof Error ? error.message : "Unable to load README.");
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initForm);
} else {
  initForm();
}
