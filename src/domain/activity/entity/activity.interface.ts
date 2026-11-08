export default interface ActivityInterface {
  changeName(name: string): ActivityInterface
  changeDescription(description: string): ActivityInterface
  changeLabel(label: string): ActivityInterface
  changeIconName(iconName: string): ActivityInterface

  readonly id: string
  readonly name: string
  readonly description: string
  readonly label: string
  readonly iconName: string
}
