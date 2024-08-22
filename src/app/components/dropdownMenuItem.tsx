export default function DropdownMenuItem({
    children, callback, noClose
  }: Readonly<{
    children: React.ReactNode,
    callback?: Function,
    noClose?: boolean
  }>) {
    return (
      <div className="flex flex-row">
        <button className={"grow hover:bg-cadet_gray-100 text-left focus:bg-cadet_gray-100 " + 
          "active:bg-cadet_gray-300 py-1.5 border-b border-french_gray-200 " + (noClose ? " noDropClose" : "")} onClick={callback !== undefined ? () => {callback()} : () => {}}>
          <div className="no-click flex flex-row flex-nowrap items-center children-no-interact">{children}</div>
        </button>
      </div>
    )
}