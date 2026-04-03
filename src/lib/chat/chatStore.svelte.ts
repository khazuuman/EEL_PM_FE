import type { HubConnection } from "@microsoft/signalr";
import { createConnection, setToken } from "./signalR";

interface Message {
    messageId: string;
    groupId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    senderRole: string;
    messageContent: string;
    sendAt: Date;
    isEdited?: boolean;
    editedAt?: Date;
    attachment?: Attachment[];
}

interface Member {
    userId: string;
    fullName: string;
    avatarUrl: string;
    role: string;
}

interface Attachment {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
}

export type { Attachment, Message, Member };

let onNewMessage: (() => void) | null = null;

export function setOnNewMessage(cb: (() => void) | null) {
    onNewMessage = cb;
}

export const chatState = $state({
    messages: [] as Message[],
    members: [] as Member[],
    isConnected: false,
    isLoadingHistory: false,
    currentUserId: '',
    currentUserName: '',
    currentUserAvatar: ''
});

export function setCurrentUser(userId: string, userName: string, avatarUrl = '') {
    chatState.currentUserId = userId;
    chatState.currentUserName = userName;
    chatState.currentUserAvatar = avatarUrl;
}

let hub: HubConnection | null = null;

// export async function joinGroup(groupId: string, token: string) {
//     // ✅ Nếu đã có hub cũ → stop trước khi tạo mới, tránh duplicate
//     if (hub) {
//         hub.off('ReceiveMessage'); // gỡ listener cũ
//         await hub.stop();
//         hub = null;
//     }
//     hub = createConnection(token);

//     hub.onreconnecting((err) => {
//         console.warn('🟡 SignalR: Đang reconnect...', err);
//         chatState.isConnected = false;
//     });

//     hub.onreconnected((connectionId) => {
//         console.log('🟢 SignalR: Reconnected! connectionId =', connectionId);
//         chatState.isConnected = true;
//     });

//     hub.onclose((err) => {
//         console.error('🔴 SignalR: Kết nối đóng', err);
//         chatState.isConnected = false;
//     });

//     hub.on('ReceiveMessage', (message: Message) => {
//         console.log('📨 ReceiveMessage:', message);

//         // ✅ Tránh duplicate message (nếu server echo lại tin của mình)
//         const exists = chatState.messages.some(m => m.messageId === message.messageId);
//         if (!exists) {
//             chatState.messages = [...chatState.messages, message];
//             onNewMessage?.();
//         }
//     });

//     console.log('⏳ SignalR: Đang kết nối...');
//     try {
//         await hub.start();
//         console.log('✅ SignalR: Kết nối thành công! State:', hub.state, '| ID:', hub.connectionId);
//         chatState.isConnected = true;
//     } catch (err) {
//         console.error('❌ SignalR: Kết nối thất bại!', err);
//         chatState.isConnected = false;
//         return;
//     }

//     console.log(`🚪 SignalR: Joining group "${groupId}"...`);
//     await hub.invoke('JoinGroup', groupId);
//     console.log(`✅ SignalR: Đã join group "${groupId}"`);

//     await Promise.all([
//         loadHistory(groupId),
//         loadMembers(groupId)
//     ]);
// }

export async function joinGroup(groupId: string, token: string) {
    console.log('🔵 joinGroup called | groupId:', groupId, '| type:', typeof groupId, '| token len:', token?.length);
    setToken(token);
    if (hub) {
        console.log('🔁 Hub cũ tồn tại, state:', hub.state, '| stopping...');
        hub.off('ReceiveMessage');
        try {
            await hub.stop();
            console.log('✅ Hub cũ đã stop');
        } catch (e) {
            console.warn('⚠️ Stop hub cũ lỗi:', e);
        }
        hub = null;
    }

    hub = createConnection();
    console.log('🔨 Hub mới tạo xong');

    hub.onreconnecting((err) => {
        console.warn('🟡 SignalR: Đang reconnect...', err);
        chatState.isConnected = false;
    });

    hub.onreconnected((connectionId) => {
        console.log('🟢 SignalR: Reconnected! connectionId =', connectionId);
        chatState.isConnected = true;
    });

    hub.onclose((err) => {
        console.error('🔴 SignalR: Kết nối đóng', err);
        chatState.isConnected = false;
    });

    hub.on('ReceiveMessage', (message: Message) => {
        const exists = chatState.messages.some(m => m.messageId === message.messageId);
        if (!exists) {
            chatState.messages = [...chatState.messages, message];
            onNewMessage?.();
        }
    });

    // Trong joinGroup, sửa phần hub.start():
    console.log('⏳ hub.start()...');
    try {
        await hub.start();
        console.log('✅ hub.start() OK | state:', hub.state, '| connectionId:', hub.connectionId);
        chatState.isConnected = true;
    } catch (err: any) {
        const is401 = err?.message?.includes('401') || err?.message?.includes('Unauthorized');

        if (is401) {
            console.log('🔄 Token expired at start, refreshing...');
            const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setToken(data.accessToken);
                // Retry joinGroup với token mới — chỉ retry 1 lần
                await joinGroup(groupId, data.accessToken);
                return; // quan trọng: return để không chạy tiếp code bên dưới
            } else {
                window.location.href = '/login';
                return;
            }
        }

        console.error('❌ hub.start() FAILED:', err);
        chatState.isConnected = false;
        return;
    }

    console.log(`🚪 Invoking JoinGroup with groupId="${groupId}" (${typeof groupId})...`);
    try {
        await hub.invoke('JoinGroup', Number(groupId));
        console.log(`✅ JoinGroup "${groupId}" thành công`);
    } catch (err) {
        console.error(`❌ JoinGroup "${groupId}" FAILED:`, err);
        // Log thêm chi tiết nếu là HubException
        if (err instanceof Error) {
            console.error('   message:', err.message);
            console.error('   stack:', err.stack);
        }
        return; // dừng, không loadHistory nếu join fail
    }

    await Promise.all([
        loadHistory(groupId),
        loadMembers(groupId)
    ]);
}

export async function loadMembers(groupId: string) {
    try {
        const res = await fetch(`/api/chat/${groupId}/members`, {
            credentials: 'include'
        });
        const data = await res.json();
        chatState.members = data?.data ?? [];
    } catch (err) {
        console.error('❌ loadMembers lỗi:', err);
    }
}

export async function loadHistory(
    groupId: string,
    before?: string,
    limit = 20
) {
    chatState.isLoadingHistory = true;

    // ✅ Build params đúng cách
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set('before', before);

    try {
        const url = `/api/chat/${groupId}/history?${params.toString()}`;
        console.log('🌐 loadHistory URL:', url);

        const res = await fetch(url, { credentials: 'include' });

        if (!res.ok) {
            console.error(`❌ loadHistory ${res.status}:`, await res.text());
            return;
        }

        const data = await res.json();
        const messages = data?.data ?? data?.messages ?? data ?? [];
        if (before) {
            // Load more (kéo lên) → prepend tin cũ hơn lên đầu
            chatState.messages = [...messages, ...chatState.messages];
        } else {
            // Load lần đầu → sort theo thời gian tăng dần (cũ → mới)
            const sorted = [...messages].sort(
                (a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime()
            );
            chatState.messages = sorted;
        }

    } catch (err) {
        console.error('❌ loadHistory lỗi:', err);
    } finally {
        chatState.isLoadingHistory = false;
    }
}

// export async function sendMessage(groupId: string, content: string) {
//     await hub?.invoke('SendMessage', groupId, content, []);
// }

export async function sendMessage(groupId: string, content: string, attachments: Attachment[] = []) {
    if (!hub) return;

    // ✅ Optimistic update — thêm vào UI ngay trước khi invoke
    const optimisticMsg: Message = {
        messageId: `temp-${Date.now()}`, // ID tạm, sẽ bị replace khi loadHistory
        groupId,
        senderId: chatState.currentUserId,
        senderName: 'Bạn',
        messageContent: content,
        sendAt: new Date(),
        senderRole: '',
        attachment: attachments
    };
    chatState.messages = [...chatState.messages, optimisticMsg];
    onNewMessage?.();

    try {
        await hub.invoke('SendMessage', Number(groupId), content, attachments);
    } catch (err: any) {
        console.error('❌ SendMessage lỗi:', err?.message ?? err);
        // ✅ Rollback nếu gửi thất bại
        chatState.messages = chatState.messages.filter(
            m => m.messageId !== optimisticMsg.messageId
        );
    }
}

export async function uploadFile(
    groupId: string,
    file: File
): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`/api/chat/${groupId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    const data = await res.json();

    // ✅ Normalize về đúng shape Attachment
    return {
        fileUrl: data.fileUrl ?? data.url ?? '',
        fileName: data.fileName ?? data.name ?? file.name,
        fileSize: data.fileSize ?? data.size ?? file.size,
        fileType: data.fileType ?? data.type ?? file.type
    };
}

export async function leaveGroup(groupId: string) {
    if (!hub) return;
    try {
        hub.off('ReceiveMessage'); // ✅ gỡ listener trước
        await hub.invoke('LeaveGroup', groupId);
        await hub.stop();
    } catch (err) {
        console.error('❌ leaveGroup lỗi:', err);
    } finally {
        hub = null;
        chatState.isConnected = false;
        chatState.messages = [];
        chatState.members = [];
    }
}