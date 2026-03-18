import { Modal, Checkbox, List, Radio, Collapse } from "antd";
import Button from '../atoms/Button.jsx';
import { useEffect, useState, useCallback } from "react";
import genericStyle from "../../style/generic.module.css";

const { Panel } = Collapse;

// Bevande fisse per i menu (SENZA prezzo - inclusa nel menu)
const MENU_BEVANDE = [
  { nome: "Acqua naturale" },
  { nome: "Acqua frizzante" },
  { nome: "Coca Cola" },
  { nome: "Coca Zero" },
  { nome: "Sprite" },
  { nome: "Fanta" },
  { nome: "Tè pesca" },
  { nome: "Tè limone" },
];

export const IngredientiModal = ({
  open,
  onClose,
  ingredienti,
  selectedProduct,
  selectedExtras,
  handleToggleExtra,
  handleAddToOrder,
}) => {
  // States locali
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedBevanda, setSelectedBevanda] = useState(null);
  const [selectedVariante, setSelectedVariante] = useState(null);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [menuActiveKey, setMenuActiveKey] = useState(null);
  const [bevandeActiveKey, setBevandeActiveKey] = useState(null);


  useEffect(() => {
    console.log("selectedProduct:", selectedProduct);
  }, [selectedProduct]);

  // Reset quando cambia prodotto o si chiude
  useEffect(() => {
    if (!open) {
      setSelectedMenuItem(null);
      setSelectedBevanda(null);
      setSelectedVariante(null);
      setRemovedIngredients([]);
      setMenuActiveKey(null);
      setBevandeActiveKey(null);
    }
  }, [open]);

  const handleToggleRemove = useCallback((nomeIngrediente) => {
    setRemovedIngredients(prev =>
      prev.includes(nomeIngrediente)
        ? prev.filter(i => i !== nomeIngrediente)
        : [...prev, nomeIngrediente]
    );
  }, []);

  const handleMenuCollapseChange = useCallback((key) => {
    // se clicchi sul panel già aperto, lo richiude
    const currentKey = Array.isArray(key) ? key[0] : key;
    if (currentKey === menuActiveKey) {
      setMenuActiveKey(null);
    } else {
      setMenuActiveKey(currentKey);
    }
  }, [menuActiveKey]);

  const handleBevandeCollapseChange = useCallback((key) => {
    const currentKey = Array.isArray(key) ? key[0] : key;
    if (currentKey === bevandeActiveKey) {
      setBevandeActiveKey(null);
    } else {
      setBevandeActiveKey(currentKey);
    }
  }, [bevandeActiveKey]);

  const handleConfirmOrder = useCallback(() => {
    const prodottoFinale = {
      ...selectedProduct,
      extras: selectedExtras,
      removedIngredients: removedIngredients.length > 0 ? removedIngredients : undefined,
      menuScelta: selectedMenuItem,
      menuBevanda: selectedBevanda,
      variante: selectedVariante,
    };
    handleAddToOrder(prodottoFinale);
    onClose();
  }, [selectedProduct, selectedExtras, removedIngredients, selectedMenuItem, selectedBevanda, selectedVariante, handleAddToOrder, onClose]);

  // Dati derivati
  const menuOptions = selectedProduct?.scelta || [];
  const removableIngredients = selectedProduct?.ingredienti_removibili || [];
  const varianti = selectedProduct?.varianti || [];

  // Se è un menu E ha già un panino selezionato con ingredienti removibili
  const menuPaninoHaRemovibili = selectedMenuItem?.ingredienti_removibili?.length > 0;
  const currentRemovableIngredients = menuPaninoHaRemovibili
    ? selectedMenuItem.ingredienti_removibili
    : removableIngredients;

  // Controlli completamento
  const isMenuPaninoComplete = !menuOptions.length || !!selectedMenuItem;
  const isMenuBevandaComplete = !menuOptions.length || !!selectedBevanda;
  const isMenuComplete = isMenuPaninoComplete && isMenuBevandaComplete;
  const isVarianteComplete = !varianti.length || !!selectedVariante;
  const isReadyToOrder = isMenuComplete && isVarianteComplete;

  const getPrezzoFinaleExtra = useCallback((prezzo) => {
    const formato = selectedProduct?.formato || selectedMenuItem?.formato;
    return formato === "Teglia intera" || formato === "Famiglia" ? prezzo * 2 : prezzo;
  }, [selectedProduct?.formato, selectedMenuItem?.formato]);

  const getFormatoPerExtra = () => {
    return selectedMenuItem?.formato || selectedProduct?.formato;
  };

  // Header accordion menu - bello e informativo
  const renderMenuHeader = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '4px 0'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{
          fontWeight: 600,
          fontSize: 15,
          color: selectedMenuItem ? '#1890ff' : '#333'
        }}>
          {selectedMenuItem ? `${selectedMenuItem.nome}` : "Seleziona panino del menu"}
        </span>
      </div>
      <span
        style={{
          fontSize: 12,
          padding: '4px 12px',
          borderRadius: 20,
          fontWeight: 500,
          backgroundColor: selectedMenuItem ? '#e6f7ff' : '#fff2f0',
          color: selectedMenuItem ? '#1890ff' : '#ff4d4f',
          border: `1px solid ${selectedMenuItem ? '#91d5ff' : '#ffccc7'}`,
          minWidth: 90,
          textAlign: 'center'
        }}
      >
        {selectedMenuItem ? 'Selezionato' : 'Obbligatorio'}
      </span>
    </div>
  );

  const renderBevandeHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: selectedBevanda ? '#52c41a' : '#333' }}>
          {selectedBevanda ? `${selectedBevanda.nome}` : "Seleziona bevanda"}
        </span>
      </div>
      <span
        style={{
          fontSize: 12,
          padding: '4px 12px',
          borderRadius: 20,
          fontWeight: 500,
          backgroundColor: selectedMenuItem ? '#e6f7ff' : '#fff2f0',
          color: selectedMenuItem ? '#1890ff' : '#ff4d4f',
          border: `1px solid ${selectedMenuItem ? '#91d5ff' : '#ffccc7'}`,
          minWidth: 90,
          textAlign: 'center'
        }}
      >
        {selectedBevanda ? 'Selezionata' : 'Obbligatoria'}
      </span>
    </div>
  );

  const totalModifiche = selectedExtras.length + removedIngredients.length;

  return (
    <Modal
      open={open}
      centered
      zIndex={5000}
      title={
        <>
          <div style={{ padding: '0 5px' }}>
            <p className={genericStyle.nomeProdotto}>
              {selectedProduct?.nome}
            </p>
            {selectedProduct?.formato && (
              <p className={genericStyle.ingredienti}>
                <span style={{ color: 'var(--color-alternative-primary)' }}> Formato: </span>
                {selectedProduct.formato}
              </p>
            )}
            <p style={{ borderBottom: '1px solid #ccc', paddingBottom: 12 }} className={genericStyle.ingredienti}>
              {selectedProduct.tipo !== "menu_scelta" && <span style={{ color: 'var(--color-alternative-primary)' }}> Ingredienti: </span>}
              {selectedProduct?.ingredienti}
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: 18, fontWeight: 600 }}>
              {menuOptions.length > 0 ? "Menu completo" :
                currentRemovableIngredients.length > 0 ? "Personalizza" :
                  "Ingredienti extra"}
            </p>
          </div>
        </>
      }
      onCancel={onClose}
      footer={
        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          position: "sticky",
          bottom: 0,
          background: "white",
          padding: '16px 12px',
          borderTop: "1px solid #f0f0f0",
          zIndex: 10,
          borderRadius: '0 0 12px 12px'
        }}>
          <Button
            label={
              !isReadyToOrder
                ? menuOptions.length > 0
                  ? "Completa menu"
                  : "Completa la selezione"
                : totalModifiche > 0
                  ? `Aggiungi ${totalModifiche} modifi${totalModifiche === 1 ? 'ca' : 'che'}`
                  : "Aggiungi senza modifiche"
            }
            variant="primaryAlt"
            onClick={handleConfirmOrder}
            disabled={!isReadyToOrder}
            style={{ minWidth: 160 }}
          />
          <Button
            label="Annulla"
            variant="secondary"
            onClick={onClose}
          />
        </div>
      }
    >
      <div style={{
        maxHeight: "50vh",
        overflowY: "auto",
        paddingBottom: 16,
        padding: '0 16px'
      }}>

        {/* 1️⃣ MENU CON ACCORDION BELLO E RICHIEDIBILE */}
        {menuOptions.length > 0 && (
          <>
            <Collapse
              accordion
              activeKey={menuActiveKey}
              onChange={handleMenuCollapseChange}
              bordered={false}
              expandIconPosition="end"
              style={{
                background: 'transparent',
                marginBottom: 16,
              }}
              items={[
                {
                  key: 'menu',
                  label: renderMenuHeader(),
                  children: (
                    <List
                      dataSource={menuOptions}
                      renderItem={(item) => (
                        <List.Item
                          onClick={() => setSelectedMenuItem(item)}
                          style={{
                            cursor: "pointer",
                            padding: "12px 16px",
                            borderRadius: 8,
                            marginBottom: 8,
                            background: selectedMenuItem?.nome === item.nome ? "#e6f7ff" : "white",
                            border: `1px solid ${selectedMenuItem?.nome === item.nome ? "#1890ff" : "#f0f0f0"}`,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: selectedMenuItem?.nome === item.nome
                              ? "0 2px 8px rgba(24, 144, 255, 0.15)"
                              : "none"
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                                {item.nome}
                              </div>
                              {item.ingredienti && (
                                <div style={{
                                  fontSize: 13,
                                  color: '#666',
                                  lineHeight: 1.4,
                                  background: '#f9f9f9',
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  borderLeft: '3px solid #1890ff'
                                }}>
                                  {item.ingredienti}
                                </div>
                              )}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  ),
                  style: {
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                  }
                }
              ]}
            />

            {menuOptions.length > 0 && (
              <Collapse
                accordion
                activeKey={bevandeActiveKey}
                onChange={handleBevandeCollapseChange}
                bordered={false}
                expandIconPosition="end"
                style={{
                  background: 'transparent',
                  marginBottom: 16,
                }}
                items={[
                  {
                    key: 'bevande',
                    label: renderBevandeHeader(),
                    children: (
                      <List
                        dataSource={MENU_BEVANDE}
                        renderItem={(bevanda) => (
                          <List.Item
                            onClick={() => setSelectedBevanda(bevanda)}
                            style={{
                              cursor: "pointer",
                              padding: "12px 16px",
                              borderRadius: 8,
                              marginBottom: 6,
                              background: selectedBevanda?.nome === bevanda.nome ? "#e6fff2" : "white",
                              border: `1px solid ${selectedBevanda?.nome === bevanda.nome ? "#52c41a" : "#f0f0f0"}`,
                              transition: "all 0.2s"
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 500, fontSize: 15 }}>{bevanda.nome}</span>
                              <span style={{
                                color: '#52c41a',
                                fontSize: 13,
                                fontWeight: 500,
                                background: '#f6ffed',
                                padding: '2px 8px',
                                borderRadius: 12,
                                border: '1px solid #b7eb8f',
                                marginLeft: 12
                              }}>
                                Inclusa
                              </span>
                            </div>
                          </List.Item>
                        )}
                      />
                    ),
                    style: {
                      borderRadius: 12,
                      border: '1px solid #f0f0f0',
                      overflow: 'hidden',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                    }
                  }
                ]}
              />
            )}
          </>
        )}

        {/* 2️⃣ VARIANTE PANINO/PIADINA */}
        {varianti.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{
              margin: '16px 0 12px 0',
              color: '#722ed1',
              fontSize: 16,
              fontWeight: 600
            }}>
              🥖 Formato
            </h4>
            <Radio.Group
              value={selectedVariante?.tipo}
              onChange={(e) => {
                const v = varianti.find(v => v.tipo === e.target.value);
                setSelectedVariante(v);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {varianti.map((v) => (
                <Radio key={v.tipo} value={v.tipo} style={{ padding: 12 }}>
                  <span style={{ fontWeight: 500, fontSize: 15 }}>
                    {v.tipo.charAt(0).toUpperCase() + v.tipo.slice(1)}
                  </span>
                  {v.sovrapprezzo > 0 && (
                    <span style={{
                      color: '#ff4d4f',
                      marginLeft: 12,
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      (+{v.sovrapprezzo}€)
                    </span>
                  )}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        )}

        {/* 3️⃣ RIMUOVI INGREDIENTI */}
        {(currentRemovableIngredients.length > 0 || removedIngredients.length > 0) && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{
              margin: '16px 0 12px 0',
              color: '#faad14',
              fontSize: 16,
              fontWeight: 600
            }}>
              Rimuovi ingredienti
              {menuPaninoHaRemovibili && (
                <span style={{
                  fontSize: 13,
                  color: '#666',
                  marginLeft: 8,
                  fontWeight: 400
                }}>
                  ({selectedMenuItem.nome})
                </span>
              )}
            </h4>
            <List
              dataSource={currentRemovableIngredients}
              renderItem={(nome) => {
                const isRemoved = removedIngredients.includes(nome);
                return (
                  <List.Item style={{ paddingBlock: 12 }} key={nome}>
                    <Checkbox
                      checked={isRemoved}
                      onChange={() => handleToggleRemove(nome)}
                      style={{ fontSize: 15 }}
                    >
                      Rimuovi <strong style={{ color: '#faad14' }}>{nome}</strong>
                    </Checkbox>
                  </List.Item>
                );
              }}
            />
          </div>
        )}

        {/* 4️⃣ AGGIUNGI EXTRA */}
        {ingredienti?.length > 0 && (
          <div>
            <h4 style={{
              margin: '16px 0 12px 0',
              color: "var(--color-alternative-primary)",
              fontSize: 16,
              fontWeight: 600
            }}>
              Aggiungi extra
            </h4>
            <List
              dataSource={ingredienti}
              renderItem={({ ingrediente, prezzo }) => {
                const isChecked = selectedExtras.some(e => e.ingrediente === ingrediente);
                const prezzoFinale = getPrezzoFinaleExtra(prezzo);
                return (
                  <List.Item style={{ paddingBlock: 12 }} key={ingrediente}>
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleToggleExtra(ingrediente, getFormatoPerExtra(), selectedExtras)}
                      style={{ fontSize: 15 }}
                    >
                      <strong>{ingrediente}</strong>{' '}
                      <span style={{
                        color: 'var(--color-danger-dark)',
                        marginLeft: 8,
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        (+{prezzoFinale.toFixed(2)} €)
                      </span>
                    </Checkbox>
                  </List.Item>
                );
              }}
            />
          </div>
        )}

        {/* Nessuna personalizzazione */}
        {(!menuOptions.length && !varianti.length && !currentRemovableIngredients.length && !ingredienti?.length) && (
          <div style={{
            padding: 48,
            textAlign: 'center',
            color: '#52c41a',
            fontStyle: 'normal',
            fontSize: 16
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Perfetto!</div>
            <div style={{ fontSize: 14, color: '#666' }}>Questo prodotto non richiede personalizzazioni</div>
          </div>
        )}
      </div>
    </Modal>
  );
};
