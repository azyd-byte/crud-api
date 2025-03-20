import React, { useEffect, useState } from "react";
import axios from "axios";

const Table = () => {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState(""); // Notifikasi
  const [editId, setEditId] = useState(null);

  //Fetch data dari API saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all")
      .then((response) => {
        setData(response.data); //simpan data ke state
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
  };

  //Fungsi untuk menambah data
  const handleAdd = (e) => {
    e.preventDefault();
    if (editId) {
      //Jika sedang dalam mode edit, panggil updateData()
      updateData();
    } else {
      axios
        .post("https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all", {
          name,
          avatar,
        })
        .then((response) => {
          setData([...data, response.data]); // update state dengan data baru
          setName(""); //reset form
          setAvatar("");
          setMessage("✅ Data berhasil ditambahkan!"); //set notifikasi

          setTimeout(() => setMessage(""), 2500);
        })
        .catch((error) => {
          console.error("Error adding data: ", error);
          setMessage("❌ Gagal menambahkan data!");
        });
    }
  };

  //Fungsi untuk mengisi form dengan data yang akan diedit
  const handleEdit = (item) => {
    setEditId(item?.id);
    setName(item?.name);
    setAvatar(item?.avatar);
  };

  //fungsi untuk mengupdate data
  const updateData = () => {
    axios
      .put(
        `https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all/${editId}`,
        {
          name: name,
          avatar: avatar,
        }
      )
      .then((response) => {
        setData(
          data.map((item) => (item.id === editId ? response.data : item))
        );
        setName("");
        setAvatar("");
        setEditId(null);
        setMessage("✅ Data berhasil diperbarui!");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        setMessage("❌ Gagal memperbarui data!");
      });
  };

  //Fungsi Hapus Data
  const handleDelete = (id) => {
    if (window.confirm("Apakah kamu yakin ingin menghapus data ini?")) {
      axios
        .delete(
          `https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all/${id}`
        )
        .then(() => {
          //ambil ulang data terbaru setelah penghapusan
          return axios.get(
            "https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all"
          );
        })
        .then((response) => {
          // Sortir data berdasarkan ID lama
          let updatedData = response.data.sort((a, b) => a.id - b.id);

          //update ID agar tetap berurutab dari 1,2,3,...
          const updatePromises = updatedData.map((item, index) => {
            return axios.put(
              `https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all/${item.id}`,
              {
                id: index + 1, //set ID baru
                name: item.name,
                avatar: item.avatar,
              }
            );
          });

          //Tunggu semua update selesai
          return Promise.all(updatePromises);
        })
        .then(() => {
          // Ambil data terbaru setelah ID diperbarui
          return axios.get(
            "https://67d2916190e0670699be1f4c.mockapi.io/sekolah/get-all"
          );
        })
        .then((response) => {
          setData(response.data); // Update state dengan data terbaru
          setMessage("✅ Data berhasil dihapus dan ID diperbarui!");
          setTimeout(() => setMessage(""), 3000);
        })
        .catch((error) => {
          console.error("Error updating IDs:", error);
          setMessage("❌ Gagal memperbarui ID setelah penghapusan!");
        });
    }
  };

  return (
    <div>
      <h2>Data Sekolah</h2>

      {/* Notifikasi */}
      {message && (
        <div
          style={{
            background: "#dff0d8",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          {message}
        </div>
      )}

      {/* Form Tambah/Edit Data */}
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Avatar"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          required
        />
        <button type="submit">{editId ? "Update" : "Tambah"}</button>
      </form>

      {/* Tabel Data */}
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Avatar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item?.id}</td>
                <td>{item?.name}</td>
                <td>{item?.avatar}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button
                    onClick={() => handleDelete(item?.id)}
                    style={{
                      marginLeft: "5px",
                      background: "red",
                      color: "white",
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Loading data...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
