import React, { useState } from 'react';
import { RiDeleteBin7Line } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { DeleteAccountPermanentaly } from '../../../../../services/Operations/DashBoard';
import ConfirmationModal from '../../../../Common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
  const [modal, setModal] = useState(null);
  const { user } = useSelector(state => state.profile);
  const { token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-red-500/[0.03] border border-red-500/10 p-10 rounded-[2.5rem] flex items-start gap-8 transition-all hover:bg-red-500/[0.05]">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <RiDeleteBin7Line size={24} />
        </div>
        
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-red-500 tracking-tight">Danger Zone: Termination</h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Terminating your account is irreversible. All enrolled English Academy batches, career progress, and certifications will be permanently erased.
          </p>
          <button 
            onClick={() => setModal({
              heading: "Initiate Termination?",
              text1: "You are about to permanently delete your academy profile.",
              button1Text: "Delete",
              button2Text: "Cancel",
              btn1Onclick: () => dispatch(DeleteAccountPermanentaly(token, user.id, navigate)),
              btn2Onclick: () => setModal(null)
            })}
            className="text-red-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-red-500 transition-all w-fit mt-2 border-b border-red-400/20 pb-1"
          >
            I understand, delete my account
          </button>
        </div>
      </div>
      {modal && <ConfirmationModal data={modal} />}
    </>
  );
};

export default DeleteAccount;