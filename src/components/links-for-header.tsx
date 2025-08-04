import Link from "next/link"


export const LinkForHeader = ({ title, href, icon }: { title: string, href: string, icon: React.ReactNode }) => {
  return (
    <Link href={href} target="_blank">
      <div className="flex flex-col items-center justify-center w-16 font-poppins transition-scale duration-300 hover:scale-120">
        {icon}
        <div>{title}</div>
      </div>
    </Link>
  )
}
