import { Elective, Choice, AdvisorResponse, Analytics, WaiverRequest } from "@/lib/types";

// Set to false when live Supabase & Next.js API are active
export const USE_MOCK = false;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
export const MOCK_ELECTIVES: Elective[] = [
  {
    id: "e1",
    title: "Deep Learning & Neural Networks",
    dept: "Computer Science",
    credits: 4,
    capacity: 50,
    enrolled: 47, // >90% full
    difficulty: "hard",
    prereqs: ["Machine Learning Fundamentals"],
    description: "Deep convolutional architectures, transformers, backpropagation mathematics, and generative modeling.",
    tags: ["AI", "Deep Learning", "PyTorch"],
    day: "Monday",
    start: "09:00",
    end: "10:30",
  },
  {
    id: "e2",
    title: "Cloud Native Architecture & K8s",
    dept: "Computer Science",
    credits: 3,
    capacity: 45,
    enrolled: 30,
    difficulty: "medium",
    prereqs: ["Operating Systems"],
    description: "Containerization, microservices communication, distributed tracing, and Kubernetes orchestrations.",
    tags: ["Cloud", "DevOps", "Containers"],
    day: "Monday", // Clashes with e1 (09:30 overlaps 09:00-10:30)
    start: "09:30",
    end: "11:00",
  },
  {
    id: "e3",
    title: "Natural Language Processing",
    dept: "Computer Science",
    credits: 3,
    capacity: 40,
    enrolled: 25,
    difficulty: "hard",
    prereqs: ["Machine Learning Fundamentals"],
    description: "Tokenization, transformer self-attention, large language model fine-tuning, and prompt architectures.",
    tags: ["NLP", "LLMs", "AI"],
    day: "Wednesday",
    start: "10:00",
    end: "11:30",
  },
  {
    id: "e4",
    title: "Big Data Analytics with Spark",
    dept: "Data Science",
    credits: 3,
    capacity: 40,
    enrolled: 32,
    difficulty: "medium",
    prereqs: ["Database Systems"],
    description: "Distributed memory computations, RDDs, real-time Kafka pipelines, and large scale data engineering.",
    tags: ["Big Data", "Spark", "Pipelines"],
    day: "Tuesday",
    start: "11:00",
    end: "12:30",
  },
  {
    id: "e5",
    title: "Applied Computer Vision",
    dept: "Data Science",
    credits: 4,
    capacity: 35,
    enrolled: 33, // >90% full
    difficulty: "hard",
    prereqs: ["Machine Learning Fundamentals"], // Student 2 lacks this
    description: "Object detection, YOLOv8 pipelines, vision transformers, and camera calibration for autonomy.",
    tags: ["Computer Vision", "AI", "OpenCV"],
    day: "Thursday",
    start: "13:00",
    end: "14:30",
  },
  {
    id: "e6",
    title: "Embedded IoT Architecture",
    dept: "Electronics & Comm",
    credits: 3,
    capacity: 40,
    enrolled: 22,
    difficulty: "medium",
    prereqs: ["Operating Systems"],
    description: "Microcontroller architectures, RTOS scheduling, hardware bus protocols (I2C/SPI), and edge sensors.",
    tags: ["IoT", "Hardware", "Firmware"],
    day: "Tuesday",
    start: "14:00",
    end: "15:30",
  },
  {
    id: "e7",
    title: "Tech Product Management & Growth",
    dept: "Management",
    credits: 3,
    capacity: 60,
    enrolled: 56, // >90% full
    difficulty: "easy",
    prereqs: [],
    description: "Product strategy, MVP validation, metrics instrumentation, user interviews, and A/B growth loops.",
    tags: ["Product", "Strategy", "Management"],
    day: "Tuesday",
    start: "16:00",
    end: "17:30",
  },
  {
    id: "e8",
    title: "AI Ethics, Law & Public Policy",
    dept: "Management",
    credits: 2,
    capacity: 70,
    enrolled: 40,
    difficulty: "easy",
    prereqs: [],
    description: "Algorithmic transparency, intellectual property, regulatory policy, and socio-technical implications of AI.",
    tags: ["Ethics", "Policy", "Governance"],
    day: "Wednesday",
    start: "14:00",
    end: "15:30",
  },
];

export let MOCK_CHOICES: Choice[] = [
  {
    id: "c1",
    elective: MOCK_ELECTIVES[0], // Deep Learning
    preference: 1,
    status: "confirmed",
  },
  {
    id: "c2",
    elective: MOCK_ELECTIVES[3], // Spark
    preference: 2,
    status: "confirmed",
  },
  {
    id: "c3",
    elective: MOCK_ELECTIVES[6], // Tech Product Mgmt (>90% full)
    preference: 3,
    status: "waitlist",
    reason: "Course capacity reached (56/60 seats). Placed on priority waitlist.",
  },
  {
    id: "c4",
    elective: MOCK_ELECTIVES[1], // Cloud Native (Clash with Deep Learning)
    preference: 4,
    status: "blocked",
    reason: "Clash with Deep Learning & Neural Networks (Monday 09:30 vs 09:00-10:30)",
  },
];

export const MOCK_ADVISOR: AdvisorResponse = {
  recommendations: [
    {
      elective: "Deep Learning & Neural Networks",
      match_score: 95,
      reason: "Directly matches your interest in machine learning and core AI engineering.",
      seat_chance: 15,
    },
    {
      elective: "Big Data Analytics with Spark",
      match_score: 88,
      reason: "Essential distributed compute foundation for scalable machine learning pipelines.",
      seat_chance: 45,
    },
    {
      elective: "Tech Product Management & Growth",
      match_score: 80,
      reason: "Provides cross-functional leadership skills for deploying real-world AI applications.",
      seat_chance: 20,
    },
  ],
  rejected: [
    {
      elective: "Applied Computer Vision",
      reason: "Missing prerequisite: Machine Learning Fundamentals",
    },
  ],
};

export const MOCK_ANALYTICS: Analytics = {
  perElective: [
    { title: "Deep Learning", choices: 47, capacity: 50 },
    { title: "Cloud Native", choices: 30, capacity: 45 },
    { title: "NLP", choices: 25, capacity: 40 },
    { title: "Big Data Spark", choices: 32, capacity: 40 },
    { title: "Computer Vision", choices: 33, capacity: 35 },
    { title: "Tech Product Mgmt", choices: 56, capacity: 60 },
  ],
  deptSplit: [
    { dept: "Computer Science", count: 102 },
    { dept: "Data Science", count: 65 },
    { dept: "Management", count: 96 },
    { dept: "Electronics & Comm", count: 22 },
  ],
  waitlistTotal: 14,
};

// API Functions with automatic fallback
export async function getElectives(): Promise<Elective[]> {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_ELECTIVES;
  }
  try {
    const res = await fetch("/api/electives");
    if (!res.ok) throw new Error("Failed to fetch electives");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return MOCK_ELECTIVES;
    }
    return data;
  } catch (e) {
    console.warn("Using mock electives fallback:", e);
    return MOCK_ELECTIVES;
  }
}

export async function getChoices(): Promise<Choice[]> {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_CHOICES;
  }
  try {
    const res = await fetch("/api/choices");
    if (!res.ok) throw new Error("Failed to fetch choices");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return MOCK_CHOICES;
    }
    return data;
  } catch (e) {
    console.warn("Using mock choices fallback:", e);
    return MOCK_CHOICES;
  }
}

export async function addChoice(
  electiveId: string,
  preference: number
): Promise<{ ok: boolean; choice?: Choice; status?: string; error?: string }> {
  try {
    const res = await fetch("/api/choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ electiveId, preference }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok) return data;
      if (data.status === "blocked") return data;
    }
  } catch (e: any) {
    console.warn("API choices failed, falling back to in-memory state:", e);
  }

  // Graceful in-memory demo fallback
  await delay(150);
  const elective = MOCK_ELECTIVES.find((e) => e.id === electiveId);
  if (!elective) return { ok: false, error: "Course not found" };

  const isWaiverApproved = MOCK_WAIVERS.some(
    (w) => w.electiveId === electiveId && w.status === "approved"
  );

  const isStudent2 = typeof document !== "undefined" && document.cookie.includes("student2@demo.edu");
  if (!isWaiverApproved && isStudent2 && elective.prereqs.includes("Machine Learning Fundamentals")) {
    return { ok: false, status: "blocked", error: "Missing prereq: Machine Learning Fundamentals" };
  }

  if (elective.id === "e2" && MOCK_CHOICES.some((c) => c.elective.id === "e1")) {
    return { ok: false, status: "blocked", error: "Clash with Deep Learning & Neural Networks" };
  }

  const isFull = elective.enrolled >= elective.capacity;
  const newChoice: Choice = {
    id: "c_" + Date.now(),
    elective,
    preference: preference || MOCK_CHOICES.length + 1,
    status: isFull ? "waitlist" : "confirmed",
    reason: isFull ? "Capacity reached" : undefined,
  };
  MOCK_CHOICES = [...MOCK_CHOICES, newChoice];
  return { ok: true, choice: newChoice };
}

export async function removeChoice(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/choices/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      if (data.ok) return data;
    }
  } catch (e: any) {
    console.warn("API remove choice failed, falling back to in-memory state:", e);
  }
  MOCK_CHOICES = MOCK_CHOICES.filter((c) => c.id !== id);
  return { ok: true };
}

export async function askAdvisor(goal: string, interests: string[]): Promise<AdvisorResponse> {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_ADVISOR;
  }
  try {
    const res = await fetch("/api/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, interests }),
    });
    if (!res.ok) throw new Error("Advisor request failed");
    return await res.json();
  } catch (e) {
    console.warn("Using mock advisor response:", e);
    return MOCK_ADVISOR;
  }
}

export async function chatWithAdvisor(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<{ reply: string; suggestedElectives: Elective[] }> {
  try {
    const res = await fetch("/api/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    return await res.json();
  } catch (e: any) {
    console.warn("Chat advisor fallback:", e);
    return {
      reply: "I recommend exploring Deep Learning & Neural Networks or Cloud Native Architecture based on your major and credits!",
      suggestedElectives: [MOCK_ELECTIVES[0], MOCK_ELECTIVES[1]],
    };
  }
}

export async function getAnalytics(): Promise<Analytics> {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_ANALYTICS;
  }
  try {
    const res = await fetch("/api/analytics?demo_role=admin");
    if (!res.ok) throw new Error("Failed to fetch analytics");
    const data = await res.json();
    if (!data.perElective || data.perElective.length === 0) {
      return MOCK_ANALYTICS;
    }
    return data;
  } catch (e) {
    console.warn("Using mock analytics response:", e);
    return MOCK_ANALYTICS;
  }
}

// Faculty & Instructor Waiver Workflow
export let MOCK_WAIVERS: WaiverRequest[] = [
  {
    id: "w1",
    studentId: "s2",
    studentName: "Maya Chen",
    studentEmail: "student2@demo.edu",
    electiveId: "e1",
    electiveTitle: "Deep Learning & Neural Networks",
    missingPrereq: "Machine Learning Fundamentals",
    reason: "Completed Stanford CS229 certificate and built open-source CNN library on GitHub (github.com/mayachen/cnn-torch).",
    status: "pending",
    createdAt: "Today, 10:30 AM",
  },
  {
    id: "w2",
    studentId: "s3",
    studentName: "Jordan Smith",
    studentEmail: "jordan.smith@demo.edu",
    electiveId: "e5",
    electiveTitle: "Applied Computer Vision & Robotics",
    missingPrereq: "Machine Learning Fundamentals",
    reason: "Worked as Computer Vision research intern at Apex Robotics Summer 2025.",
    status: "pending",
    createdAt: "Today, 11:15 AM",
  },
];

export async function getWaivers(): Promise<WaiverRequest[]> {
  await delay(100);
  return [...MOCK_WAIVERS];
}

export async function submitWaiverRequest(params: {
  studentName: string;
  studentEmail: string;
  electiveId: string;
  electiveTitle: string;
  missingPrereq: string;
  reason: string;
}): Promise<{ ok: boolean; waiver?: WaiverRequest; error?: string }> {
  await delay(200);
  const newWaiver: WaiverRequest = {
    id: "w_" + Date.now(),
    studentId: params.studentEmail,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    electiveId: params.electiveId,
    electiveTitle: params.electiveTitle,
    missingPrereq: params.missingPrereq,
    reason: params.reason,
    status: "pending",
    createdAt: "Just now",
  };
  MOCK_WAIVERS = [newWaiver, ...MOCK_WAIVERS];
  return { ok: true, waiver: newWaiver };
}

export async function updateWaiverStatus(
  waiverId: string,
  status: "approved" | "rejected"
): Promise<{ ok: boolean }> {
  await delay(150);
  MOCK_WAIVERS = MOCK_WAIVERS.map((w) => (w.id === waiverId ? { ...w, status } : w));
  return { ok: true };
}

