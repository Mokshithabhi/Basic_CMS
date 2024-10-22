import { useOther, useOthers } from "@liveblocks/react/suspense";
import Image from "next/image";
import React from "react";

const ActiveCollaborators = () => {
  const otherUsers = useOthers();
  const collaborator = otherUsers.map((e) => e.info);
  return (
    <ul className="collaborators-list">
      {collaborator.map(({ id, name, color, avator }) => (
        <li key={id}>
          <Image
            src={avator}
            alt={name}
            width={100}
            height={100}
            className="inline-block size-8 rounded-full ring-2 ring-dark-100"
            style={{border:`3px solid ${color}`}}
          />
        </li>
      ))}
    </ul>
  );
};

export default ActiveCollaborators;
