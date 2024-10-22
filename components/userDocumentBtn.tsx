'use client';

import { createDocument } from "@/lib/actions/room.actions";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";


const AddUserDocumentBtn: React.FC<AddDocumentBtnProps> = ({
  userId,
  email,
}) => {
  const router = useRouter()
  const handleDocument = async() => {
    try{
    const room = await createDocument({userId,email})
    if(room) router.push(`/documents/${room.id}`)
    }catch(e){
      console.error(e)
    }
  };
  return (
    <Button
      type="submit"
      onClick={handleDocument}
      className="gradient-blue flex gap-1 shadow-md"
    >
      <Image src ="/assets/icons/add.svg" alt="addIcon" width={24} height={24}/>
      <p className="hidden sm:block">Start Blank Document</p>
    </Button>
  );
};

export default AddUserDocumentBtn;
