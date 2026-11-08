import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

type IconProps = { className?: string };

const Icon = ({ name, className = "size-4" }: IconProps & { name: string }) => {
    const paths: Record<string, React.ReactNode> = {
        vault: (
            <>
                <rect x="4" y="3" width="16" height="18" rx="3" />
                <path d="M8 3v18M12 8h5M12 12h5M12 16h3" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),
        github: (
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15 1.8a13.4 13.4 0 0 0-7 0C4.8.1 3.7.5 3.7.5A5 5 0 0 0 3.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.3 3.5 6.5 6.8 7A4.8 4.8 0 0 0 8 18v4m-4-3c-3 .9-3-2-4-2.5" />
        ),
        upload: (
            <>
                <path d="M12 16V4m0 0L7 9m5-5 5 5" />
                <path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" />
            </>
        ),
        chevron: <path d="m8 10 4 4 4-4" />,
        external: (
            <>
                <path d="M15 4h5v5M10 14 20 4" />
                <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
            </>
        ),
        file: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6M8 13h8M8 17h5" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
        moon: <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />,
        sun: (
            <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
            </>
        ),
        x: <path d="m6 6 12 12M18 6 6 18" />,
        inbox: (
            <>
                <path d="M4 4h16l2 12H2L4 4Z" />
                <path d="M2 16h5l2 3h6l2-3h5" />
            </>
        ),
        arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    };

    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
};

export type Paper = {
    id: string;
    code: string;
    name: string;
    year: string;
    type: string;
    semester: string;
    size: string;
    solution: boolean;
    file_url: string;
    solution_url: string | null;
    downloads: number;
};

type CourseOption = {
    id: string;
    code: string;
    name: string;
    semester: string;
};

type AcademicYearOption = {
    id: string;
    year_label: string;
};

type FilterKey = "year" | "type" | "semester";

const filterLabels: Record<FilterKey, string> = {
    year: "Academic Year",
    type: "Exam Type",
    semester: "Semester",
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilterDropdown({
                            filterKey,
                            selected,
                            options,
                            onToggle,
                        }: {
    filterKey: FilterKey;
    selected: string[];
    options: string[];
    onToggle: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`control-chip ${selected.length ? "control-chip-active" : ""}`}
                aria-expanded={open}
            >
                <span>{filterLabels[filterKey]}</span>
                {selected.length > 0 && <span className="filter-count">{selected.length}</span>}
                <Icon
                    name="chevron"
                    className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="filter-menu">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        {filterLabels[filterKey]}
                    </p>
                    {options.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-[var(--faint)]">No options</p>
                    ) : (
                        options.map((option) => {
                            const checked = selected.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => onToggle(option)}
                                    className="filter-option"
                                >
                  <span className={`check-box ${checked ? "check-box-active" : ""}`}>
                    {checked && <Icon name="check" className="size-3" />}
                  </span>
                                    {option}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

function SortDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // New sort options replacing download count
    const options = [
        "Academic Year (Newest)",
        "Academic Year (Oldest)",
        "Course Code (A–Z)",
        "Course Code (Z–A)",
    ];

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                className="control-chip"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                <span className="text-[var(--faint)]">Sort:</span>
                <span className="text-[var(--text)]">{value}</span>
                <Icon
                    name="chevron"
                    className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="filter-menu sort-menu w-56">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Sort papers
                    </p>
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className="filter-option justify-between text-xs"
                            onClick={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            <span>{option}</span>
                            {value === option && <Icon name="check" className="size-3.5 text-blue-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function App() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    // Available database entities for dropdowns and uploads
    const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
    const [availableYears, setAvailableYears] = useState<AcademicYearOption[]>([]);

    const [filterOptions, setFilterOptions] = useState<Record<FilterKey, string[]>>({
        year: [],
        type: [],
        semester: [],
    });

    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
        year: [],
        type: [],
        semester: [],
    });
    const [solutionOnly, setSolutionOnly] = useState(false);
    const [sort, setSort] = useState("Academic Year (Newest)");
    const [uploadOpen, setUploadOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // Upload Form State
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedYearId, setSelectedYearId] = useState("");
    const [selectedExamType, setSelectedExamType] = useState("Final Exam");
    const [selectedSemester, setSelectedSemester] = useState("Sem 1");
    const [paperFile, setPaperFile] = useState<File | null>(null);
    const [hasSolutionFile, setHasSolutionFile] = useState(false);
    const [solutionFile, setSolutionFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fetchAllData = async () => {
        setLoading(true);

        const { data: papersData, error: papersError } = await supabase
            .from("view_papers_display")
            .select("*");

        if (papersError) {
            console.error("Error fetching papers:", papersError.message);
        } else if (papersData) {
            setPapers(papersData as Paper[]);
        }

        const { data: yearsData } = await supabase
            .from("academic_years")
            .select("id, year_label")
            .order("year_label", { ascending: false });

        if (yearsData) {
            setAvailableYears(yearsData);
            if (!selectedYearId && yearsData.length > 0) {
                setSelectedYearId(yearsData[0].id);
            }
        }

        const { data: coursesData } = await supabase
            .from("courses")
            .select("id, code, name, semester")
            .order("code", { ascending: true });

        if (coursesData) {
            setAvailableCourses(coursesData);
            if (!selectedCourseId && coursesData.length > 0) {
                setSelectedCourseId(coursesData[0].id);
            }
        }

        const uniqueSemesters = Array.from(
            new Set(coursesData?.map((c) => c.semester).filter(Boolean))
        ).sort();

        const uniqueTypes = Array.from(
            new Set(papersData?.map((p) => p.type).filter(Boolean))
        ).sort();

        setFilterOptions({
            year: yearsData ? yearsData.map((y) => y.year_label) : [],
            type: uniqueTypes.length ? uniqueTypes : ["Final Exam", "Test 1", "Test 2"],
            semester: uniqueSemesters.length ? uniqueSemesters : ["Sem 1", "Sem 2"],
        });

        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        const shortcut = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", shortcut);
        return () => window.removeEventListener("keydown", shortcut);
    }, []);

    const results = useMemo(() => {
        const filtered = papers.filter((paper) => {
            const search = `${paper.code} ${paper.name} ${paper.type}`.toLowerCase();
            return (
                search.includes(query.toLowerCase()) &&
                (!filters.year.length || filters.year.includes(paper.year)) &&
                (!filters.type.length || filters.type.includes(paper.type)) &&
                (!filters.semester.length || filters.semester.includes(paper.semester)) &&
                (!solutionOnly || paper.solution)
            );
        });

        return [...filtered].sort((a, b) => {
            switch (sort) {
                case "Academic Year (Oldest)":
                    return a.year.localeCompare(b.year); // Ascending: 2022 -> 2024
                case "Course Code (A–Z)":
                    return a.code.localeCompare(b.code); // e.g. CPT111 -> CPT212
                case "Course Code (Z–A)":
                    return b.code.localeCompare(a.code); // e.g. CPT343 -> CPT111
                case "Academic Year (Newest)":
                default:
                    return b.year.localeCompare(a.year); // Descending: 2024 -> 2022
            }
        });
    }, [papers, query, filters, solutionOnly, sort]);

    const toggleFilter = (key: FilterKey, value: string) => {
        setFilters((current) => ({
            ...current,
            [key]: current[key].includes(value)
                ? current[key].filter((item) => item !== value)
                : [...current[key], value],
        }));
    };

    const resetFilters = () => {
        setQuery("");
        setFilters({ year: [], type: [], semester: [] });
        setSolutionOnly(false);
        setSort("Academic Year (Newest)");
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadError(null);

        if (!paperFile) {
            setUploadError("Please select a paper PDF to upload.");
            return;
        }
        if (!selectedCourseId || !selectedYearId) {
            setUploadError("Please select a course and academic year.");
            return;
        }

        try {
            setIsUploading(true);

            const targetCourse = availableCourses.find((c) => c.id === selectedCourseId);
            const targetYear = availableYears.find((y) => y.id === selectedYearId);
            const courseCode = targetCourse?.code || "COURSE";
            const yearStr = targetYear?.year_label.replace("/", "-") || "YEAR";
            const timestamp = Date.now();

            // 1. Upload Main Paper PDF to Storage
            const cleanExamType = selectedExamType.replace(/\s+/g, "");
            const paperFilePath = `papers/${courseCode}_${yearStr}_${cleanExamType}_${timestamp}.pdf`;

            const { error: paperUploadErr } = await supabase.storage
                .from("exam-papers")
                .upload(paperFilePath, paperFile, {
                    contentType: "application/pdf",
                    upsert: true,
                });

            if (paperUploadErr) throw new Error(`Paper upload failed: ${paperUploadErr.message}`);

            const { data: paperUrlData } = supabase.storage
                .from("exam-papers")
                .getPublicUrl(paperFilePath);

            // 2. Upload Solution PDF (if selected)
            let solutionUrl: string | null = null;
            if (hasSolutionFile && solutionFile) {
                const solutionFilePath = `solutions/${courseCode}_${yearStr}_${cleanExamType}_scheme_${timestamp}.pdf`;
                const { error: solutionUploadErr } = await supabase.storage
                    .from("exam-papers")
                    .upload(solutionFilePath, solutionFile, {
                        contentType: "application/pdf",
                        upsert: true,
                    });

                if (solutionUploadErr) throw new Error(`Solution upload failed: ${solutionUploadErr.message}`);

                const { data: solUrlData } = supabase.storage
                    .from("exam-papers")
                    .getPublicUrl(solutionFilePath);
                solutionUrl = solUrlData.publicUrl;
            }

            // 3. Insert record into database
            const formattedSize = formatFileSize(paperFile.size);

            const { error: insertErr } = await supabase.from("papers").insert([
                {
                    course_id: selectedCourseId,
                    academic_year_id: selectedYearId,
                    exam_type: selectedExamType,
                    semester: selectedSemester,
                    file_url: paperUrlData.publicUrl,
                    file_size: formattedSize,
                    has_solution: Boolean(solutionUrl),
                    solution_url: solutionUrl,
                    downloads: 0,
                },
            ]);

            if (insertErr) {
                if (insertErr.code === "23505") {
                    throw new Error("This paper already exists for this course, year, semester, and exam type.");
                }
                throw new Error(insertErr.message);
            }

            // 4. Refresh view & reset form
            await fetchAllData();
            setPaperFile(null);
            setSolutionFile(null);
            setHasSolutionFile(false);
            setUploadOpen(false);
        } catch (err: any) {
            console.error(err);
            setUploadError(err.message || "Failed to upload paper. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={theme}>
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
                <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-5 sm:px-8">
                        <a href="#" className="flex items-center gap-3" aria-label="ExamVault home">
              <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white shadow-[0_0_24px_rgba(37,99,235,.28)]">
                <Icon name="vault" className="size-[18px]" />
              </span>
                            <span className="text-[15px] font-semibold tracking-[-0.02em]">ExamVault</span>
                            <span className="hidden rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:inline">
                CS Repository
              </span>
                        </a>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                type="button"
                                className="nav-search hidden md:flex"
                                onClick={() => searchRef.current?.focus()}
                            >
                                <Icon name="search" className="size-4" />
                                <span>Quick search</span>
                                <kbd>⌘ K</kbd>
                            </button>
                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                            >
                                <Icon name={theme === "dark" ? "sun" : "moon"} className="size-[17px]" />
                            </button>
                            <a
                                href="https://github.com/Aresiuses/ExamVault-USM"
                                target="_blank"
                                rel="noreferrer"
                                className="icon-button"
                                aria-label="View GitHub repository"
                            >
                                <Icon name="github" className="size-[17px]" />
                            </a>
                            <button
                                type="button"
                                className="primary-button ml-1"
                                onClick={() => setUploadOpen(true)}
                            >
                                <Icon name="upload" className="size-4" />
                                <span className="hidden sm:inline">Contribute</span>
                                <span className="hidden lg:inline"> / Upload Paper</span>
                            </button>
                        </div>
                    </div>
                </nav>

                <main>
                    <section className="hero-grid border-b border-[var(--border)]">
                        <div className="mx-auto max-w-[1360px] px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
                            <div className="mx-auto max-w-3xl text-center">
                                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-400">
                                    <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                                    Community-curated archive
                                </div>
                                <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
                                    Find past examination
                                    <br className="hidden sm:block" /> papers{" "}
                                    <span className="text-[var(--muted)]">&amp; solutions.</span>
                                </h1>
                                <p className="mx-auto mt-5 max-w-xl text-[15px] leading-6 text-[var(--muted)] sm:text-base">
                                    A curated archive for Computer Science undergraduates. Find the paper you need,
                                    without the digging.
                                </p>

                                <label className="search-box mx-auto mt-8 flex max-w-2xl items-center sm:mt-10">
                                    <Icon
                                        name="search"
                                        className="ml-4 size-5 shrink-0 text-[var(--muted)] sm:ml-5"
                                    />
                                    <input
                                        ref={searchRef}
                                        autoFocus
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Search by course code, title, or topic..."
                                        className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm font-medium outline-none placeholder:text-[var(--faint)] sm:px-4 sm:py-5 sm:text-[15px]"
                                    />
                                    {query ? (
                                        <button
                                            type="button"
                                            onClick={() => setQuery("")}
                                            className="mr-3 p-2 text-[var(--muted)] hover:text-[var(--text)]"
                                            aria-label="Clear search"
                                        >
                                            <Icon name="x" />
                                        </button>
                                    ) : (
                                        <kbd className="mr-4 hidden rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--muted)] sm:block">
                                            ⌘ K
                                        </kbd>
                                    )}
                                </label>
                                <p className="mt-3 text-xs text-[var(--faint)]">
                                    Try “CPT212”, “Algorithms”, or “Final Exam”
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1360px] px-5 py-8 sm:px-8 sm:py-10">
                        <div className="mb-7 flex flex-col gap-4 border-b border-[var(--border)] pb-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
                                    <FilterDropdown
                                        key={key}
                                        filterKey={key}
                                        selected={filters[key]}
                                        options={filterOptions[key]}
                                        onToggle={(value) => toggleFilter(key, value)}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    className={`control-chip ${solutionOnly ? "control-chip-active" : ""}`}
                                    onClick={() => setSolutionOnly(!solutionOnly)}
                                    aria-pressed={solutionOnly}
                                >
                  <span className={`toggle-dot ${solutionOnly ? "toggle-dot-active" : ""}`}>
                    {solutionOnly && <Icon name="check" className="size-2.5" />}
                  </span>
                                    Has solution scheme
                                </button>
                                <SortDropdown value={sort} onChange={setSort} />
                            </div>
                        </div>

                        <div className="mb-5 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--faint)]">
                                    Paper archive
                                </p>
                                <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em]">
                                    Available papers
                                </h2>
                            </div>
                            <p className="text-xs text-[var(--muted)]">
                                <span className="font-semibold text-[var(--text)]">{results.length}</span> results
                            </p>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center text-sm text-[var(--muted)]">
                                Loading exam repository...
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {results.map((paper) => (
                                    <article key={paper.id} className="paper-card group">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="course-badge">{paper.code}</span>
                                            <span className="text-[11px] font-medium text-[var(--faint)]">
                        {paper.semester}
                      </span>
                                        </div>
                                        <h3 className="mt-5 min-h-12 text-[17px] font-semibold leading-6 tracking-[-0.02em]">
                                            {paper.name}
                                        </h3>
                                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                                            <span>{paper.year}</span>
                                            <span className="size-0.5 rounded-full bg-[var(--faint)]" />
                                            <span className="type-pill">{paper.type}</span>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between border-y border-[var(--border)] py-3.5">
                      <span className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                        <Icon name="file" className="size-4" />
                        PDF <span className="text-[var(--faint)]">•</span> {paper.size}
                      </span>
                                            {paper.solution ? (
                                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                          <Icon name="check" className="size-3.5" /> Scheme attached
                        </span>
                                            ) : (
                                                <span className="text-[11px] text-[var(--faint)]">Paper only</span>
                                            )}
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <a
                                                href={paper.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="open-button"
                                            >
                                                Open Paper <Icon name="external" className="size-3.5" />
                                            </a>
                                            {paper.solution && paper.solution_url ? (
                                                <a
                                                    href={paper.solution_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="solution-button"
                                                >
                                                    Solution Scheme
                                                </a>
                                            ) : (
                                                <button type="button" className="solution-button" disabled>
                                                    Solution Scheme
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                <span className="grid size-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]">
                  <Icon name="inbox" className="size-5" />
                </span>
                                <h3 className="mt-5 text-base font-semibold">No papers found for this filter</h3>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                                    Try changing your search terms or clearing the active filters to see more papers.
                                </p>
                                <button type="button" onClick={resetFilters} className="secondary-button mt-5">
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </section>
                </main>

                <footer className="border-t border-[var(--border)]">
                    <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-5 py-6 text-xs text-[var(--faint)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <p>Built by students, for students.</p>
                        <p>{papers.length} papers indexed · Updated often</p>
                    </div>
                </footer>

                {/* Dynamic Upload Modal */}
                {uploadOpen && (
                    <div
                        className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-5 backdrop-blur-sm"
                        onMouseDown={() => !isUploading && setUploadOpen(false)}
                    >
                        <div
                            className="modal w-full max-w-lg my-8"
                            onMouseDown={(event) => event.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="upload-title"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                                        Community contribution
                                    </p>
                                    <h2 id="upload-title" className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                                        Upload a paper
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    className="icon-button"
                                    disabled={isUploading}
                                    onClick={() => setUploadOpen(false)}
                                    aria-label="Close"
                                >
                                    <Icon name="x" />
                                </button>
                            </div>

                            {uploadError && (
                                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                                    {uploadError}
                                </div>
                            )}

                            <form onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
                                {/* Course Selection */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                                        Course Code & Name
                                    </label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-[var(--strong-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    >
                                        {availableCourses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} — {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Academic Year and Semester Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                                            Academic Year
                                        </label>
                                        <select
                                            value={selectedYearId}
                                            onChange={(e) => setSelectedYearId(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-[var(--strong-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        >
                                            {availableYears.map((y) => (
                                                <option key={y.id} value={y.id}>
                                                    {y.year_label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                                            Semester
                                        </label>
                                        <select
                                            value={selectedSemester}
                                            onChange={(e) => setSelectedSemester(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-[var(--strong-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value="Sem 1">Sem 1</option>
                                            <option value="Sem 2">Sem 2</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Exam Type */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                                        Exam Type
                                    </label>
                                    <select
                                        value={selectedExamType}
                                        onChange={(e) => setSelectedExamType(e.target.value)}
                                        className="w-full rounded-lg border border-[var(--strong-border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="Final Exam">Final Exam</option>
                                        <option value="Test 1">Test 1</option>
                                        <option value="Test 2">Test 2</option>
                                    </select>
                                </div>

                                {/* Paper PDF File Dropzone */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                                        Exam Paper PDF (Required)
                                    </label>
                                    <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--strong-border)] bg-[var(--surface)] px-4 py-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                        <Icon name="upload" className="size-5 text-blue-400 mb-2" />
                                        <span className="text-xs font-medium">
                      {paperFile ? paperFile.name : "Select or drop exam PDF here"}
                    </span>
                                        <span className="text-[11px] text-[var(--faint)] mt-1">
                      {paperFile ? formatFileSize(paperFile.size) : "Up to 20 MB"}
                    </span>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            required
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) setPaperFile(e.target.files[0]);
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Marking Scheme Option */}
                                <div className="pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--text)]">
                                        <input
                                            type="checkbox"
                                            checked={hasSolutionFile}
                                            onChange={(e) => setHasSolutionFile(e.target.checked)}
                                            className="rounded border-[var(--strong-border)] text-blue-600 focus:ring-0"
                                        />
                                        <span>Attach marking scheme / solution PDF</span>
                                    </label>

                                    {hasSolutionFile && (
                                        <label className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--strong-border)] bg-[var(--surface)] px-4 py-5 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                      <span className="text-xs font-medium text-emerald-400">
                        {solutionFile ? solutionFile.name : "Select solution scheme PDF"}
                      </span>
                                            <span className="text-[11px] text-[var(--faint)] mt-1">
                        {solutionFile ? formatFileSize(solutionFile.size) : "Optional solution scheme"}
                      </span>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                required={hasSolutionFile}
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) setSolutionFile(e.target.files[0]);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="primary-button w-full justify-center py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? "Uploading paper & indexing..." : "Submit Paper"}
                                        {!isUploading && <Icon name="arrow" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
