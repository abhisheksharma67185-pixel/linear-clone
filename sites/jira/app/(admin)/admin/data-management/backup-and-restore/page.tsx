"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function BackupAndRestorePage() {
  const [showBenefits, setShowBenefits] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    jobTitle: "",
    product: "",
    message: "",
  })
  const [discussTopic, setDiscussTopic] = useState("pricing & quotes")
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Explore benefits overlay — matches Atlassian Support page style
  if (showBenefits) {
    const topics = [
      {
        title: "Overview of Atlassian Backup and Restore",
        description:
          "An overview of what Atlassian backups are and our data retention policies",
      },
      {
        title: "Understand billing for Atlassian Backup and Restore",
        description:
          "Learn who can purchase Atlassian Backup and Restore, the applicable limits, and how billing works.",
      },
      {
        title: "What data is backed up and restored",
        description:
          "View what app data types are included in our backups and restores.",
      },
      {
        title: "What is a backup policy",
        description:
          "Read how you can create backup policies, run, or edit backups",
      },
      {
        title: "Restore app data from backup",
        description:
          "Read about the different ways in which you can restore backups",
      },
      {
        title: "Customer-managed key encryption for backups",
        description:
          "Know how encryption, re-encryption, and revocation of Customer-managed keys affect backups and restores.",
      },
      {
        title: "Backup and restore: Frequently asked questions",
        description:
          "Find answers to common questions about Atlassian Backup and Restore.",
      },
      {
        title: "Manage backup and restore with sharding",
        description:
          "Learn how sharding works with backup and restore for large-scale organizations.",
      },
    ]

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        {/* Header bar */}
        <div className="border-b bg-[#0052CC]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
            <div className="flex items-center gap-8">
              <span className="text-lg font-bold text-white">
                Atlassian Support
              </span>
              <span className="text-sm text-white/70">Documentation</span>
              <span className="text-sm text-white/70">Resources</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBenefits(false)}
                className="text-sm text-white/70 hover:text-white"
              >
                Contact us
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-8 pt-8 pb-16">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => setShowBenefits(false)}
              className="hover:text-foreground"
            >
              Atlassian Support
            </button>
            <span>/</span>
            <span>Organization administration Resources</span>
          </div>

          <h1 className="mb-8 text-2xl font-bold">
            Backup and restore Atlassian app data
          </h1>

          <div className="grid grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="rounded-lg border p-6 transition-colors hover:bg-muted/30"
              >
                <h3 className="mb-2 text-base font-semibold">{topic.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {topic.description}
                </p>
                <Button variant="outline" size="sm">
                  View topic
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const resetContactForm = () => {
    setContactForm({
      email: "",
      firstName: "",
      lastName: "",
      company: "",
      jobTitle: "",
      product: "",
      message: "",
    })
    setSubmitted(false)
    setDiscussTopic("pricing & quotes")
  }

  const DISCUSS_TOPICS = [
    "pricing & quotes",
    "a product demo",
    "upgrading my plan",
    "technical questions",
    "billing & payments",
    "something else",
  ]

  const PRODUCTS = [
    "Jira",
    "Confluence",
    "Jira Service Management",
    "Jira Product Discovery",
    "Atlassian Guard",
    "Atlassian Analytics",
    "Bitbucket",
    "Other",
  ]

  // Contact sales page — matches original Atlassian contact form
  if (showContactForm) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
            <div className="flex items-center gap-8">
              <svg className="size-8" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L6 8v8c0 7.5 4.3 14.5 10 16 5.7-1.5 10-8.5 10-16V8L16 2z"
                  fill="#1868DB"
                />
                <path
                  d="M16 6l-6 3.5v5c0 4.7 2.7 9.1 6 10 3.3-.9 6-5.3 6-10v-5L16 6z"
                  fill="white"
                />
              </svg>
              <span className="text-lg font-semibold">Enterprise</span>
              <span className="text-sm text-muted-foreground">Overview</span>
              <span className="text-sm text-muted-foreground">Success</span>
              <span className="text-sm text-muted-foreground">Resources</span>
            </div>
            <button
              onClick={() => {
                setShowContactForm(false)
                resetContactForm()
              }}
              className="rounded p-1.5 text-muted-foreground hover:bg-accent"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="mx-auto max-w-xl px-8 pt-20 pb-16 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="size-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold">
              Thank you for contacting us!
            </h2>
            <p className="mb-6 text-muted-foreground">
              Our sales team will review your request and get back to you within
              1 business day.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setShowContactForm(false)
                resetContactForm()
              }}
            >
              Back to Backup and restore
            </Button>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-8 pt-12 pb-16">
            <div className="grid grid-cols-3 gap-12">
              {/* Left: form */}
              <div className="col-span-2">
                {/* Topic selector */}
                <div className="mb-2 flex items-baseline gap-3">
                  <h1 className="text-2xl font-bold">
                    I&apos;d like to discuss
                  </h1>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTopicDropdownOpen(!topicDropdownOpen)}
                      className="flex items-center gap-2 border-b-2 border-blue-600 pb-0.5 text-2xl font-bold text-blue-600"
                    >
                      {discussTopic}
                      <svg
                        className="size-5"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>
                    {topicDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setTopicDropdownOpen(false)}
                        />
                        <div className="absolute top-10 left-0 z-50 w-64 rounded-md border bg-popover shadow-md">
                          {DISCUSS_TOPICS.map((topic) => (
                            <button
                              key={topic}
                              type="button"
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent ${topic === discussTopic ? "bg-accent font-medium" : ""}`}
                              onClick={() => {
                                setDiscussTopic(topic)
                                setTopicDropdownOpen(false)
                              }}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="mb-8 text-muted-foreground">
                  Get a quote or ask pricing questions about a product or
                  service you might purchase.
                </p>

                <div className="max-w-lg space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                      Your company email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Personal email domains will result in an error.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={contactForm.firstName}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={contactForm.lastName}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={contactForm.company}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        Job title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={contactForm.jobTitle}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            jobTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                      Which product or service are you inquiring about?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={contactForm.product}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          product: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <option value="">Select a product</option>
                      {PRODUCTS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      If you&apos;re asking about multiple products, select the
                      one with the most users.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                      Message
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      placeholder="Tell us more about what you need..."
                      rows={4}
                      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowContactForm(false)
                        resetContactForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        if (
                          !contactForm.email.trim() ||
                          !contactForm.firstName.trim() ||
                          !contactForm.lastName.trim() ||
                          !contactForm.company.trim() ||
                          !contactForm.jobTitle.trim() ||
                          !contactForm.product
                        )
                          return
                        setSubmitted(true)
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right sidebar: calculators */}
              <div className="space-y-4">
                <div className="rounded-lg border p-5">
                  <h3 className="mb-2 text-base font-bold">
                    Cloud pricing calculator
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Estimate your bill for key Cloud products on Premium plans.
                  </p>
                  <Button variant="outline" size="sm">
                    Get estimate
                  </Button>
                </div>

                <div className="rounded-lg border p-5">
                  <h3 className="mb-2 text-base font-bold">
                    Cloud value calculator
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Compare the total cost of your server products to Cloud.
                  </p>
                  <Button variant="outline" size="sm">
                    Compare costs
                  </Button>
                </div>

                <div className="rounded-lg border p-5">
                  <h3 className="mb-2 text-base font-bold">
                    Data Center comparison
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    See what it would cost to upgrade your server SENs to Data
                    Center.
                  </p>
                  <Button variant="outline" size="sm">
                    Compare
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Backup and restore</h1>

      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        {/* Safe/vault illustration */}
        <div className="relative mb-6">
          <svg className="h-36 w-36" viewBox="0 0 144 144" fill="none">
            <rect x="24" y="24" width="80" height="88" rx="6" fill="#2684FF" />
            <rect x="20" y="20" width="88" height="12" rx="3" fill="#4C9AFF" />
            <rect x="32" y="40" width="64" height="60" rx="4" fill="#0052CC" />
            <circle
              cx="58"
              cy="68"
              r="18"
              fill="#FFC400"
              stroke="#FF991F"
              strokeWidth="2"
            />
            <circle cx="58" cy="68" r="4" fill="#FF991F" />
            <line
              x1="58"
              y1="52"
              x2="58"
              y2="56"
              stroke="#FF991F"
              strokeWidth="2"
            />
            <line
              x1="58"
              y1="80"
              x2="58"
              y2="84"
              stroke="#FF991F"
              strokeWidth="2"
            />
            <line
              x1="42"
              y1="68"
              x2="46"
              y2="68"
              stroke="#FF991F"
              strokeWidth="2"
            />
            <line
              x1="70"
              y1="68"
              x2="74"
              y2="68"
              stroke="#FF991F"
              strokeWidth="2"
            />
            <line
              x1="58"
              y1="68"
              x2="58"
              y2="55"
              stroke="#FF991F"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="58"
              y1="68"
              x2="68"
              y2="74"
              stroke="#FF991F"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="82" y="62" width="8" height="12" rx="2" fill="#FFC400" />
            <rect x="30" y="108" width="8" height="12" rx="2" fill="#0052CC" />
            <rect x="90" y="108" width="8" height="12" rx="2" fill="#0052CC" />
            <rect x="100" y="60" width="12" height="16" rx="3" fill="#DE350B" />
          </svg>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          Backup up your Jira and Confluence data
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Easily recover your data in case of accidental or malicious deletion.
          Start by creating a backup policy.
        </p>

        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowBenefits(true)}
          >
            Explore benefits
          </button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowContactForm(true)}
          >
            Contact sales
          </Button>
        </div>

        {/* Features list */}
        <div className="w-full rounded-lg border p-5 text-left">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                <svg
                  className="size-4 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-sm">
                Automate backups daily, weekly, or on demand
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                <svg
                  className="size-4 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm">
                Restore data within 30 days using Atlassian storage
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                <svg
                  className="size-4 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <span className="text-sm">
                Get reliable protection with full site recovery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
