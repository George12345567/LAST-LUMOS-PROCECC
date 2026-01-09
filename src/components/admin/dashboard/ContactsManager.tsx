import { Contact } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Trash2, CheckCircle, Mail } from 'lucide-react';

interface ContactsManagerProps {
    contacts: Contact[];
    onUpdateStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}

export const ContactsManager = ({ contacts, onUpdateStatus, onDelete }: ContactsManagerProps) => {
    return (
        <Card className="h-full border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Mail className="w-5 h-5 text-pink-500" />
                        Inbox & Leads
                    </CardTitle>
                    <Badge variant="outline">{contacts.filter(c => c.status === 'new').length} New</Badge>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                        {contacts.map(contact => (
                            <div
                                key={contact.id}
                                className={`p-4 rounded-xl border transition-all hover:bg-white hover:shadow-sm ${contact.status === 'new' ? 'bg-white border-pink-100 border-l-4 border-l-pink-500' : 'bg-slate-50 border-slate-100'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-bold ${contact.status === 'new' ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {contact.name}
                                        </h4>
                                        {contact.status === 'new' && <Badge className="bg-pink-500 text-[10px] h-4">NEW</Badge>}
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(contact.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                    {contact.message}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-slate-400">{contact.phone}</span>
                                    <div className="flex gap-2">
                                        {contact.status === 'new' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => onUpdateStatus(contact.id, 'read')}
                                            >
                                                <CheckCircle className="w-3 h-3 mr-1" /> Mark Read
                                            </Button>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => onDelete(contact.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {contacts.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                No messages
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
