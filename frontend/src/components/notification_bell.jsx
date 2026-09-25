export default function NotificationBell({ unreadCount, isOpen, onClick }) {
  return <button className="bell" aria-label="Open notifications" aria-expanded={isOpen} onClick={onClick}>♧{unreadCount > 0 && <i>{unreadCount > 9 ? '9+' : unreadCount}</i>}</button>
}
