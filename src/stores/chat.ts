import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatRoom, ChatMessage } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const rooms = ref<ChatRoom[]>([])
  const currentRoom = ref<ChatRoom | null>(null)
  const messages = ref<ChatMessage[]>([])
  const isOpen = ref(false)

  const totalUnread = computed(() =>
    rooms.value.reduce((sum, room) => sum + room.unreadCount, 0)
  )

  const directRooms = computed(() =>
    rooms.value.filter(room => room.type === 'direct')
  )

  const groupRooms = computed(() =>
    rooms.value.filter(room => room.type === 'group')
  )

  function toggleChat() {
    isOpen.value = !isOpen.value
  }

  function openChat() {
    isOpen.value = true
  }

  function closeChat() {
    isOpen.value = false
  }

  function selectRoom(room: ChatRoom) {
    currentRoom.value = room
    loadMessages(room.id)
  }

  async function loadRooms() {
    // TODO: API 연동
    // const response = await axios.get('/api/chat/rooms')

    // 임시 데이터
    rooms.value = [
      {
        id: 1,
        name: '김철수',
        type: 'direct',
        participants: [],
        lastMessage: {
          id: 1,
          roomId: 1,
          senderId: 2,
          senderName: '김철수',
          content: '회의 시간 변경됐나요?',
          timestamp: new Date().toISOString(),
          isRead: false
        },
        unreadCount: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: '개발팀 채팅방',
        type: 'group',
        participants: [],
        lastMessage: {
          id: 2,
          roomId: 2,
          senderId: 3,
          senderName: '이영희',
          content: '배포 완료했습니다',
          timestamp: new Date().toISOString(),
          isRead: true
        },
        unreadCount: 0,
        createdAt: new Date().toISOString()
      }
    ]
  }

  async function loadMessages(_roomId: number) {
    // TODO: API 연동
    // const response = await axios.get(`/api/chat/rooms/${_roomId}/messages`)

    messages.value = []
  }

  async function sendMessage(content: string) {
    if (!currentRoom.value) return

    // TODO: Socket.io로 메시지 전송
    const newMessage: ChatMessage = {
      id: Date.now(),
      roomId: currentRoom.value.id,
      senderId: 1,
      senderName: '나',
      content,
      timestamp: new Date().toISOString(),
      isRead: true
    }

    messages.value.push(newMessage)
  }

  return {
    rooms,
    currentRoom,
    messages,
    isOpen,
    totalUnread,
    directRooms,
    groupRooms,
    toggleChat,
    openChat,
    closeChat,
    selectRoom,
    loadRooms,
    loadMessages,
    sendMessage
  }
})
