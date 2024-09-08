import { useEffect, useMemo, useState } from "react";
import { Celebrity } from "../../types/Celebrity";
import data from '../../data/celebrities.json'
import { IoIosSearch } from "react-icons/io"
import "./Home.css"
import { SlPencil as Pencil } from "react-icons/sl"
import { BsTrash3 as Trash } from "react-icons/bs"
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { CiCircleCheck as Check } from "react-icons/ci";
import { RxCrossCircled as X } from "react-icons/rx";

function Home() {
    const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Celebrity>>({});

    const toggleAccordion = (id: number) => {
        if (editingId === null) {
            setCelebrities(celebrities.map(celeb => ({
                ...celeb,
                isOpen: celeb.id === id ? !celeb.isOpen : false
            })));
        }
    };
    const calculateAge = (dob: string) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    const handleEdit = (celebrity: Celebrity) => {
        if (calculateAge(celebrity.dob) >= 18) {
            setEditingId(celebrity.id);
            setEditForm({
                gender: celebrity.gender,
                country: celebrity.country,
                description: celebrity.description
            });
        } else {
            alert('Cannot edit details of users under 18 years old.');
        }
    };
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        if (name == "dob") {
            setEditForm(prev => ({ ...prev, [name]: value.toString() }));
            return;
        }
        if (name === "name") {
            const value = e.target.value;
            const strs = value.split(' ');
            const last = strs.pop();
            const first = strs.join(' ');
            setEditForm(prev => ({ ...prev, first, last }));
            return;
        }
        setEditForm(prev => ({ ...prev, [name]: value }));
    };
    const validateForm = () => {
        if (!editForm.country?.trim() || !editForm.description?.trim()) {
            alert('All fields must be filled.');
            return false;
        }
        if (/\d/.test(editForm.country)) {
            alert('Country name cannot contain numbers.');
            return false;
        }
        return true;
    };
    const handleSave = (id: number) => {
        if (validateForm()) {
            setCelebrities(celebrities.map(celeb =>
                celeb.id === id ? { ...celeb, ...editForm } : celeb
            ));
            setEditingId(null);
            setEditForm({});
        }
    };
    const handleDelete = (id: number) => {
        setCelebrities(prevCelebrities => prevCelebrities.filter(c => c.id !== id));
    };

    const capitalize = (str: string) => {
        return str[0].toUpperCase() + str.substring(1)
    }

    const filteredCelebrities = useMemo(() => {
        return celebrities.filter(c => `${c.first} ${c.last}`.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [searchTerm, celebrities])

    useEffect(() => {
        const celebritiesWithState = data.map(celeb => ({
            ...celeb,
            isOpen: false
        }));
        setCelebrities(celebritiesWithState);
    }, []);

    return (
        <div className="card-container">
            <div className="input-container">
                <IoIosSearch size={20} color="gray" />
                <input
                    type="text"
                    placeholder="Search user"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                />
            </div>
            <div>
                {filteredCelebrities.map(celeb => (
                    <div key={celeb.id} className="mb-2 border rounded-xl p-2">
                        <div
                            onClick={() => toggleAccordion(celeb.id)}
                            className="flex items-center justify-between p-2 cursor-pointer"
                        >
                            <div className="card-left">
                                <img src={celeb.picture} alt={`${celeb.first} ${celeb.last}`} className="w-15 h-15 mr-4 rounded-full" />
                                <input className={`text-lg font-semibold`} value={`${editForm.first ?? celeb.first} ${editForm.last ?? celeb.last}`}
                                    readOnly={!(celeb.isOpen && editingId === celeb.id)} name="name" onChange={handleInputChange} />

                            </div>
                            {celeb.isOpen ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
                        </div>
                        {celeb.isOpen && (
                            <div className="p-2">
                                <div className="banner">
                                    <div className="mb-2">
                                        <label className="block mb-1 heading">Age</label>
                                        {
                                            editingId !== celeb.id ?
                                                <input
                                                    type="text"
                                                    value={`${calculateAge(celeb.dob)} Years`}
                                                    readOnly
                                                    className="w-full rounded"
                                                />
                                                :
                                                <input
                                                    type="date"
                                                    value={editForm.dob ?? celeb.dob}
                                                    onChange={handleInputChange}
                                                    className="w-full  bg-gray-100 border rounded"
                                                    name="dob"
                                                />
                                        }
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-1  heading">Gender</label>
                                        {editingId === celeb.id
                                            ?
                                            <select
                                                name="gender"
                                                value={editForm.gender}
                                                onChange={handleInputChange}
                                                disabled={editingId !== celeb.id}
                                                className="w-full bg-white border rounded"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="transgender">Transgender</option>
                                                <option value="rather not say">Rather not say</option>
                                                <option value="other">Other</option>
                                            </select>
                                            :
                                            <input className="w-full  bg-white" value={capitalize(celeb.gender)} disabled />
                                        }
                                    </div>
                                    <div className="mb-2">
                                        <label className="block mb-1 heading">Country</label>
                                        <input
                                            name="country"
                                            value={editingId === celeb.id ? editForm.country : celeb.country}
                                            onChange={handleInputChange}
                                            readOnly={editingId !== celeb.id}
                                            className={`w-full bg-white ${editingId === celeb.id ? "border rounded" : null}`}
                                        />
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="block mb-1  heading">Description</label>
                                    <textarea
                                        name="description"
                                        value={editingId === celeb.id ? editForm.description : celeb.description}
                                        onChange={handleInputChange}
                                        readOnly={editingId !== celeb.id}
                                        className="w-full p-2 bg-white border rounded h-20"
                                    />
                                </div>
                                {editingId === celeb.id ? (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditForm({});
                                            }}

                                            className="flex items-center px-2 py-2 "
                                        >
                                            <X className="w-4 h-4 mr-2" color="red"  />
                                        </button>
                                        <button
                                            onClick={() => handleSave(celeb.id)}
                                            disabled={JSON.stringify(editForm) === JSON.stringify({
                                                gender: celeb.gender,
                                                country: celeb.country,
                                                description: celeb.description
                                            })}

                                            className="flex items-center px-2 py-2 "
                                        >
                                            <Check className="w-4 h-4 mr-2" color="green" />
                                        </button>

                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDelete(celeb.id)}
                                            className="flex items-center px-2 py-2"
                                        >
                                            <Trash className="w-4 h-4 mr-2" color="red" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(celeb)}
                                            className="flex items-center px-2 py-2 "
                                        >
                                            <Pencil className="w-4 h-4 mr-2" color="blue" />
                                        </button>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    )
}
export default Home;