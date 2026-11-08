import Link from 'next/link'

export default function Copyright() {
  return (
    <p className="mt-8 text-center text-xs text-zinc-500">
      &copy; {new Date().getFullYear()}{' '}
      <Link href="/home" className="hover:underline">
        Genesis Servir
      </Link>
      . Todos os direitos reservados.
    </p>
  )
}
