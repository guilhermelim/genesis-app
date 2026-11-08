export default interface MemberInterface {
  changeName(name: string): MemberInterface
  changeImage(image?: string): MemberInterface
  activate(): MemberInterface
  deactivate(): MemberInterface
  readonly id: string
  readonly name: string
  readonly image?: string
  readonly active: boolean
}
