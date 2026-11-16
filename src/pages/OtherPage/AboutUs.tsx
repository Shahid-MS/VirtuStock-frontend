import AboutUsCard from "./AboutUsCard";

export default function AboutUs() {
  const teamMember = [
    {
      name: "MS 2.O",
      role: "Founder | Software Engineer",
      instagramUrl: "https://www.instagram.com/being_ms_2.o",
      linkedInUrl: "https://www.linkedin.com/in/ms20",
      details:
        "As a founder-led, engineer-built company, VirtuStock is driven by a mission to simplify investing through transparent, data-driven technology. I believe great products are created where strong technology meets thoughtful design.",
      image: "/images/team-member/shahid.webp",
    },
    {
      name: "Ashish Kumar",
      role: "Co-Founder | Business Analyst",
      instagramUrl: "https://www.instagram.com/",
      linkedInUrl: "https://www.linkedin.com/in/ashish-kumar-534b97389",
      details:
        "A strategic Business Analyst and Co-Founder with expertise in translating business goals into clear requirements and actionable insights. Skilled in stakeholder collaboration, process optimization, and data-driven decision-making to drive scalable and sustainable growth.",
      image: "/images/team-member/ashish.webp",
    },
    {
      name: "Md Asif Alam",
      role: "Co-Founder | Business Analyst",
      instagramUrl: "https://www.instagram.com/asif__gabru",
      linkedInUrl: "https://www.linkedin.com/in/md-asif-alam-0035233a4",
      details:
        "As a Co-Founder and Business Analyst, I bridge the gap between business goals and technical execution. I work closely with stakeholders and development teams to define requirements, analyze processes, and ensure solutions deliver real business value.",
      image: "/images/team-member/asif.webp",
    },
    {
      name: "Kuldip Shaw",
      role: "Co-Founder | AI/ML Engineer",
      instagramUrl: "https://www.instagram.com/kuldip.shaw",
      linkedInUrl: "https://www.linkedin.com/in/kuldip-shaw-a13461200",
      details:
        "As a technical Co-Founder, I specialize in architecting and building intelligent, scalable systems that leverage the latest advancements in Generative AI. My expertise lies in designing adaptive AI pipelines and autonomous agents using frameworks like LangChain, LangGraph, and LangSmith to drive advanced Retrieval-Augmented Generation (RAG) solutions.",
      image: "/images/team-member/kuldip.webp",
    },
    {
      name: "Md Saif Ansari",
      role: "Developer | Software Engineer",
      instagramUrl: "https://www.instagram.com/",
      linkedInUrl: "https://www.linkedin.com/",
      details:
        "Experienced in developing scalable applications with clean, maintainable code. Passionate about system design, problem-solving, and delivering seamless user experiences through thoughtful engineering.",
      image: "/images/team-member/saif.webp",
    },
    {
      name: "Aman Ahamad",
      role: "Media Lead | Business Analyst ",
      instagramUrl: "https://www.instagram.com/dashing_aman2.0",
      details:
        "Enjoys turning business insights into clear strategies while leading media efforts that strengthen brand identity and audience engagement.",
      image: "/images/team-member/aman.webp",
      linkedInUrl: "https://www.linkedin.com/in/aman-ahamad-87862a3a4",
    },
  ];
  return (
    <>
      {teamMember.map((member, idx) => (
        <AboutUsCard member={member} index={idx} />
      ))}
    </>
  );
}
