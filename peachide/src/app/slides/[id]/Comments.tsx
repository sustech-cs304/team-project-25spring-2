import {usePDFContext} from "@/components/pdf/PDFEnvProvider";
import {Avatar} from "@radix-ui/react-avatar";
import {AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {MessageSquareQuote, Reply} from "lucide-react";
import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {useComment, useMaterial} from "@/app/slides/[id]/swr";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";

function ReplyBox({id, title, avatar, content, forPage, showPageNumber, children = null}:
                          {
                              id: string,
                              title: string,
                              avatar: string,
                              forPage: number,
                              showPageNumber: boolean,
                              content: string,
                              children?: any | null
                          }) {

    const {comment} = useComment(id);
    const {usersInfo, setUsersInfo} = usePDFContext();
    useEffect(() => {
        if (comment) {
            const replies = comment.replies;
            replies?.forEach((reply: any) => {
                if (!usersInfo[reply.user_id]) {
                    fetch(process.env.NEXT_PUBLIC_API_URL + `/user/${reply.user_id}`)
                            .then(res => res.json())
                            .then(data => {
                                usersInfo[reply.user_id] = data;
                                setUsersInfo({...usersInfo});
                            });
                }
            });
        }
    }, [comment]);

    return (
            <div className="flex flex-col m-2">
                <div className="flex flex-row">
                    <Avatar className="w-[40px] h-[40px] grow-0">
                        <AvatarImage src={avatar} alt={title} />
                        <AvatarFallback className="w-[40px]">U</AvatarFallback>
                    </Avatar>
                    <div className="grow pl-3">
                        <div>
                            {title}
                            {showPageNumber ? <span className="text-xs opacity-50 ml-1.5">Page {forPage}</span> : ''}
                        </div>
                        <div className="text-sm opacity-75">
                            {content}
                        </div>
                        <div className="flex items-center">
                            <span className="text-xs opacity-50"
                                    suppressHydrationWarning>{new Date().toLocaleString()}</span>
                            <ReplyDialog trigger={
                                <Button variant="ghost" size="icon" className="size-4 ml-2 mr-2">
                                    <Reply />
                                </Button>} props={{page: forPage, type: "reply", id: id}} />
                            <span>·</span>
                            <ExtraCommentDialog trigger={
                                <Button variant="ghost" className="h-4 w-12 ml-1.5 flex items-center">
                                    <span className="text-xs text-gray-200">Reply {comment?.replies?.length ? `${comment?.replies?.length}` : '0'}</span>
                                </Button>} replies={comment?.replies} fromTitle={title}
                                    props={{page: forPage, type: "comment", id: id}} />
                        </div>
                    </div>
                </div>
                {
                    children != null ? <div className="ml-8">
                        {children}
                    </div> : ''
                }
            </div>
    );
}

type ReplyProps = {
    page: number,
    type: 'comment' | 'reply',
    id?: string,
}

function ReplyDialog({trigger, props}: { trigger: React.ReactNode, props: ReplyProps }) {
    const [content, setContent] = useState('');

    return (<Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add {props.type === 'reply' ? 'Reply' : 'Comment'}</DialogTitle>
            </DialogHeader>
            <Textarea placeholder="Type your message here." />
            <DialogFooter>
                <Button type="submit">Submit</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}

function ExtraCommentDialog({trigger, props, replies, fromTitle}: {
    trigger: React.ReactNode,
    props: ReplyProps,
    replies: any[],
    fromTitle: string
}) {
    const {usersInfo} = usePDFContext();
    return (<Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Replies to {fromTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col">
                {
                    replies?.map((reply: any) => {
                        return <ReplyBox
                                id={reply.id}
                                title={usersInfo[reply.user_id]?.name}
                                avatar={usersInfo[reply.user_id]?.avatar}
                                forPage={reply.page}
                                showPageNumber={props.page !== reply.page}
                                content={reply.content}
                                key={reply.id} />;
                    })
                }
            </div>
        </DialogContent>
    </Dialog>);
}

export function CommentsSection({id}: { id: string }) {
    const {pageNumber, usersInfo, setUsersInfo} = usePDFContext();
    const {material, isLoading} = useMaterial(id);
    const [onlyThisPage, setOnlyThisPage] = React.useState(false);

    useEffect(() => {
        if (isLoading || !material) return;
        material?.comments?.forEach((comment: any) => {
            if (!usersInfo[comment.user_id]) {
                fetch(process.env.NEXT_PUBLIC_API_URL + `/user/${comment.user_id}`)
                        .then(res => res.json())
                        .then(data => {
                            usersInfo[comment.user_id] = data;
                            setUsersInfo({...usersInfo});
                        });
            }
        });
    }, [material]);

    return (<div className="h-1/3 flex flex-col">
        <hr className="my-2" />
        <div className="font-bold text-lg w-full grid grid-cols-2">
            <div className="flex items-center">
                Comments
                <div className="flex items-center ml-3">
                    <Switch id="only-this-page" checked={onlyThisPage} onCheckedChange={setOnlyThisPage} />
                    <Label htmlFor="only-this-page" className="ml-2 text-xs text-gray-600">Only for This Page</Label>
                </div>
            </div>
            <div className={"text-right"}>
                <ReplyDialog trigger={
                    <Button variant="ghost" size="icon">
                        <MessageSquareQuote />
                    </Button>
                } props={{page: pageNumber, type: "comment"}} />
            </div>
        </div>
        <div className="overflow-scroll grow">
            {material?.comments ? (
                    material?.comments
                            .filter((comment: any) => !onlyThisPage || comment.page === pageNumber)
                            .map((comment: any) => (
                                    <div key={comment.comment_id}>
                                        <ReplyBox
                                                forPage={comment.page}
                                                showPageNumber={!onlyThisPage}
                                                id={comment.comment_id}
                                                title={usersInfo[comment.user_id]?.name}
                                                avatar={usersInfo[comment.user_id]?.photo}
                                                content={comment.content}
                                        />
                                    </div>
                            ))
            ) : (
                    <div className="text-center p-4">
                        No comments available.
                    </div>
            )}
            {material?.comments?.length > 0 && material?.comments.filter((comment: any) => !onlyThisPage || comment.page === pageNumber).length === 0 && (
                    <div className="text-center p-4 text-gray-300 text-sm">
                        No comments on this page.
                    </div>
            )}
        </div>
    </div>);
}