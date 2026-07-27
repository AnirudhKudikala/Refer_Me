import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seekerData = [
  { fullName: "Alex Chen", headline: "Full Stack Engineer", currentCompany: "Shopify", githubUrl: "https://github.com/alexchen", otherSocialUrl: "https://x.com/alexchen", skills: ["React", "Node.js", "TypeScript", "PostgreSQL"], desiredRoles: ["Software Engineer", "Full Stack Developer"], experienceYears: 4, location: "San Francisco, CA", bio: "Passionate about building scalable web applications.", noticePeriod: "30 days", salaryExpectation: "14 LPA" },
  { fullName: "Priya Sharma", headline: "Backend Developer", currentCompany: "Amazon", githubUrl: "https://github.com/priyasharma", skills: ["Python", "Django", "AWS", "Docker"], desiredRoles: ["Backend Engineer", "DevOps Engineer"], experienceYears: 3, location: "New York, NY", bio: "Experienced in cloud infrastructure and API design.", noticePeriod: "60 days", salaryExpectation: "12 LPA" },
  { fullName: "Marcus Johnson", headline: "Frontend Specialist", currentCompany: "Spotify", githubUrl: "https://github.com/marcusjohnson", otherSocialUrl: "https://linkedin.com/in/marcusjohnson", skills: ["React", "Vue", "CSS", "Figma"], desiredRoles: ["Frontend Engineer", "UI Engineer"], experienceYears: 5, location: "Austin, TX", bio: "Crafting beautiful, accessible user interfaces.", noticePeriod: "Immediate", salaryExpectation: "13 LPA", immediateJoining: true },
  { fullName: "Sarah Kim", headline: "ML Engineer", skills: ["Python", "TensorFlow", "PyTorch", "SQL"], desiredRoles: ["ML Engineer", "Data Scientist"], experienceYears: 2, location: "Seattle, WA", bio: "Building intelligent systems with deep learning.", noticePeriod: "45 days", salaryExpectation: "15 LPA" },
  { fullName: "James Wilson", headline: "DevOps Engineer", skills: ["Kubernetes", "Terraform", "AWS", "CI/CD"], desiredRoles: ["DevOps Engineer", "SRE"], experienceYears: 6, location: "Denver, CO", bio: "Automating infrastructure at scale.", noticePeriod: "30 days", salaryExpectation: "16 LPA" },
  { fullName: "Emily Rodriguez", headline: "Mobile Developer", skills: ["React Native", "Swift", "Kotlin", "Firebase"], desiredRoles: ["Mobile Engineer", "iOS Developer"], experienceYears: 3, location: "Miami, FL", bio: "Cross-platform mobile apps with native performance.", noticePeriod: "15 days", salaryExpectation: "12 LPA" },
  { fullName: "David Park", headline: "Data Engineer", skills: ["Spark", "Airflow", "Python", "Snowflake"], desiredRoles: ["Data Engineer", "Analytics Engineer"], experienceYears: 4, location: "Chicago, IL", bio: "Building robust data pipelines for analytics.", noticePeriod: "30 days", salaryExpectation: "13 LPA" },
  { fullName: "Lisa Thompson", headline: "Product Engineer", skills: ["React", "GraphQL", "Node.js", "Product"], desiredRoles: ["Product Engineer", "Full Stack Developer"], experienceYears: 5, location: "Boston, MA", bio: "Bridging product and engineering.", noticePeriod: "60 days", salaryExpectation: "14 LPA" },
  { fullName: "Ryan O'Brien", headline: "Security Engineer", skills: ["Security", "Python", "AWS", "Penetration Testing"], desiredRoles: ["Security Engineer", "AppSec Engineer"], experienceYears: 7, location: "Washington, DC", bio: "Protecting applications and infrastructure.", noticePeriod: "90 days", salaryExpectation: "17 LPA" },
  { fullName: "Nina Patel", headline: "Cloud Architect", skills: ["AWS", "Azure", "GCP", "Architecture"], desiredRoles: ["Cloud Architect", "Solutions Architect"], experienceYears: 8, location: "San Jose, CA", bio: "Designing cloud-native solutions.", noticePeriod: "30 days", salaryExpectation: "18 LPA" },
  { fullName: "Tom Hughes", headline: "iOS Engineer", skills: ["Swift", "SwiftUI", "UIKit", "Core Data"], desiredRoles: ["iOS Developer", "Mobile Engineer"], experienceYears: 4, location: "Los Angeles, CA", bio: "Building polished native iOS experiences.", noticePeriod: "30 days", salaryExpectation: "13 LPA" },
  { fullName: "Ananya Reddy", headline: "Platform Engineer", skills: ["Go", "Kubernetes", "gRPC", "PostgreSQL"], desiredRoles: ["Platform Engineer", "Backend Engineer"], experienceYears: 5, location: "Atlanta, GA", bio: "Internal developer platforms and service mesh.", noticePeriod: "45 days", salaryExpectation: "15 LPA" },
  { fullName: "Chris Martinez", headline: "QA Automation Lead", skills: ["Selenium", "Cypress", "Python", "CI/CD"], desiredRoles: ["QA Engineer", "SDET"], experienceYears: 6, location: "Phoenix, AZ", bio: "Test automation and quality at scale.", noticePeriod: "30 days", salaryExpectation: "11 LPA" },
  { fullName: "Hannah Lee", headline: "UX Engineer", skills: ["React", "Design Systems", "Accessibility", "Figma"], desiredRoles: ["UX Engineer", "Frontend Engineer"], experienceYears: 3, location: "Portland, OR", bio: "Design systems and accessible UI components.", noticePeriod: "Immediate", salaryExpectation: "12 LPA", immediateJoining: true },
  { fullName: "Omar Hassan", headline: "Blockchain Developer", skills: ["Solidity", "Ethereum", "Rust", "Web3"], desiredRoles: ["Blockchain Engineer", "Smart Contract Developer"], experienceYears: 3, location: "Dallas, TX", bio: "DeFi protocols and smart contract security.", noticePeriod: "60 days", salaryExpectation: "14 LPA" },
  { fullName: "Jessica Wong", headline: "Technical PM", skills: ["Product", "SQL", "Roadmapping", "Agile"], desiredRoles: ["Technical PM", "Product Manager"], experienceYears: 5, location: "San Diego, CA", bio: "Shipping technical products with eng teams.", noticePeriod: "30 days", salaryExpectation: "13 LPA" },
  { fullName: "Kevin Brooks", headline: "Site Reliability Engineer", skills: ["Prometheus", "Grafana", "Go", "Linux"], desiredRoles: ["SRE", "DevOps Engineer"], experienceYears: 4, location: "Minneapolis, MN", bio: "Reliability, observability, and incident response.", noticePeriod: "30 days", salaryExpectation: "14 LPA" },
  { fullName: "Maria Santos", headline: "Full Stack Developer", skills: ["Next.js", "TypeScript", "Prisma", "Tailwind"], desiredRoles: ["Full Stack Developer", "Software Engineer"], experienceYears: 2, location: "Remote", bio: "Modern web apps with great DX.", noticePeriod: "15 days", salaryExpectation: "10 LPA" },
  { fullName: "Daniel Kim", headline: "Computer Vision Engineer", skills: ["OpenCV", "Python", "PyTorch", "CUDA"], desiredRoles: ["CV Engineer", "ML Engineer"], experienceYears: 4, location: "Pittsburgh, PA", bio: "Real-time vision systems for robotics.", noticePeriod: "45 days", salaryExpectation: "15 LPA" },
  { fullName: "Rachel Green", headline: "Engineering Manager", skills: ["Leadership", "React", "System Design", "Hiring"], desiredRoles: ["Engineering Manager", "Tech Lead"], experienceYears: 9, location: "San Francisco, CA", bio: "Leading high-performing product teams.", noticePeriod: "90 days", salaryExpectation: "19 LPA" },
  { fullName: "Ben Carter", headline: "Rust Systems Engineer", skills: ["Rust", "C++", "Systems", "Performance"], desiredRoles: ["Systems Engineer", "Backend Engineer"], experienceYears: 5, location: "Remote", bio: "Low-latency systems and performance tuning.", noticePeriod: "30 days", salaryExpectation: "16 LPA" },
  { fullName: "Sophie Turner", headline: "Data Scientist", skills: ["Python", "R", "Statistics", "SQL"], desiredRoles: ["Data Scientist", "Analytics Engineer"], experienceYears: 3, location: "Charlotte, NC", bio: "Experimentation and predictive modeling.", noticePeriod: "30 days", salaryExpectation: "12 LPA" },
  { fullName: "Arjun Mehta", headline: "Android Developer", skills: ["Kotlin", "Jetpack Compose", "Android", "Firebase"], desiredRoles: ["Android Developer", "Mobile Engineer"], experienceYears: 4, location: "Houston, TX", bio: "Native Android apps with modern architecture.", noticePeriod: "30 days", salaryExpectation: "13 LPA" },
  { fullName: "Laura Chen", headline: "Infrastructure Engineer", skills: ["AWS", "Terraform", "Ansible", "Networking"], desiredRoles: ["Infrastructure Engineer", "Cloud Engineer"], experienceYears: 6, location: "Raleigh, NC", bio: "Cloud infrastructure and network automation.", noticePeriod: "60 days", salaryExpectation: "15 LPA" },
  { fullName: "Ethan Wright", headline: "Game Developer", skills: ["Unity", "C#", "Unreal", "Graphics"], desiredRoles: ["Game Developer", "Graphics Engineer"], experienceYears: 4, location: "Seattle, WA", bio: "Gameplay systems and rendering optimization.", noticePeriod: "45 days", salaryExpectation: "13 LPA" },
];

const referrerData = [
  { fullName: "Michael Torres", company: "Stripe", jobTitle: "Senior Engineer", bio: "Referring strong full-stack engineers to Stripe." },
  { fullName: "Jennifer Lee", company: "Google", jobTitle: "Staff Engineer", bio: "Happy to refer backend and ML talent." },
  { fullName: "Chris Anderson", company: "Meta", jobTitle: "Engineering Manager", bio: "Looking for frontend and mobile engineers." },
];

async function main() {
  console.log("Seeding database...");

  const seekerIds: string[] = [];
  for (let i = 0; i < seekerData.length; i++) {
    const data = seekerData[i];
    const email = `seeker${i + 1}@example.com`;
    const passwordHash = await bcrypt.hash("password123", 12);
    const profileUpdatedAt = new Date(Date.now() - i * 6 * 3600000);
    const { immediateJoining, noticePeriod, ...profileFields } = data;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        seekerProfile: {
          update: {
            ...profileFields,
            noticePeriod: immediateJoining ? "" : noticePeriod,
            immediateJoining: immediateJoining ?? false,
            isProfileComplete: true,
            updatedAt: profileUpdatedAt,
          },
        },
      },
      create: {
        email,
        passwordHash,
        role: "SEEKER",
        seekerProfile: {
          create: {
            ...profileFields,
            noticePeriod: immediateJoining ? "" : noticePeriod,
            immediateJoining: immediateJoining ?? false,
            isProfileComplete: true,
            updatedAt: profileUpdatedAt,
          },
        },
      },
    });
    seekerIds.push(user.id);

    if (i < 12) {
      const resumeUploadedAt = new Date(Date.now() - i * 4 * 3600000);
      await prisma.resume.upsert({
        where: { userId: user.id },
        update: {
          fileName: `${data.fullName.replace(/\s+/g, "_")}_Resume.pdf`,
          uploadedAt: resumeUploadedAt,
        },
        create: {
          userId: user.id,
          fileName: `${data.fullName.replace(/\s+/g, "_")}_Resume.pdf`,
          fileUrl: `/uploads/seed-resume-${i + 1}.pdf`,
          fileSize: 95000 + i * 1200,
          mimeType: "application/pdf",
          uploadedAt: resumeUploadedAt,
        },
      });
    }
  }

  const referrerIds: string[] = [];
  for (let i = 0; i < referrerData.length; i++) {
    const data = referrerData[i];
    const email = `referrer${i + 1}@example.com`;
    const passwordHash = await bcrypt.hash("password123", 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { referrerProfile: { update: data } },
      create: {
        email,
        passwordHash,
        role: "REFERRER",
        referrerProfile: { create: data },
      },
    });
    referrerIds.push(user.id);
  }

  const referrer1 = referrerIds[0];
  const seeker1 = seekerIds[0];
  const seeker2 = seekerIds[1];
  const seeker3 = seekerIds[2];

  const acceptedInterest = await prisma.interest.upsert({
    where: { referrerId_seekerId: { referrerId: referrer1, seekerId: seeker1 } },
    update: { status: "ACCEPTED" },
    create: {
      referrerId: referrer1,
      seekerId: seeker1,
      status: "ACCEPTED",
      message: "Hi Alex! Your React experience looks great. I'd love to refer you at Stripe.",
    },
  });

  const conversation = await prisma.conversation.upsert({
    where: { interestId: acceptedInterest.id },
    update: {},
    create: { interestId: acceptedInterest.id },
  });

  const mockMessages = [
    { senderId: referrer1, content: "Hi Alex! Thanks for accepting. I'd like to learn more about your recent projects.", offset: -3600000 },
    { senderId: seeker1, content: "Thanks Michael! I recently built a referral platform with React and Node. Happy to share my portfolio.", offset: -3000000 },
    { senderId: referrer1, content: "That sounds perfect for our team. Can you send me your resume? I'll submit an internal referral today.", offset: -2400000 },
    { senderId: seeker1, content: "Absolutely! I've uploaded it to my profile. Looking forward to hearing back.", offset: -1800000 },
    { senderId: referrer1, content: "Great — referral submitted. I'll keep you posted on next steps!", offset: -600000 },
  ];

  for (const msg of mockMessages) {
    const existing = await prisma.message.findFirst({
      where: { conversationId: conversation.id, content: msg.content },
    });
    if (!existing) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: msg.senderId,
          content: msg.content,
          createdAt: new Date(Date.now() + msg.offset),
          readAt: msg.senderId === referrer1 ? new Date() : null,
        },
      });
    }
  }

  await prisma.interest.upsert({
    where: { referrerId_seekerId: { referrerId: referrer1, seekerId: seeker2 } },
    update: { status: "PENDING" },
    create: {
      referrerId: referrer1,
      seekerId: seeker2,
      status: "PENDING",
      message: "Your Python and Django background aligns well with our backend team.",
    },
  });

  await prisma.interest.upsert({
    where: { referrerId_seekerId: { referrerId: referrer1, seekerId: seeker3 } },
    update: { status: "DECLINED" },
    create: {
      referrerId: referrer1,
      seekerId: seeker3,
      status: "DECLINED",
      message: "Would love to connect about frontend roles.",
    },
  });

  console.log("Seed complete!");
  console.log(`${seekerData.length} seekers seeded (sorted by profile updatedAt for browse pagination)`);
  console.log("Demo accounts: seeker1@example.com / referrer1@example.com (password: password123)");
  console.log("Mock chat: log in as referrer1 or seeker1 and open Messages");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
