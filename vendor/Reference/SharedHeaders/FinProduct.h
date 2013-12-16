#pragma once

typedef enum ProtectionTypeEnum { Performance=1, Protection=2 };
typedef enum CurrencyEnum { Shekel=0, Dollar=1, Euro=2 };
typedef enum StockIndexEnum { SPY=1, SPX, NASDAQ, DOW, DAX, TA, SPY_OPT_C, SPY_OPT_P, INDEX_MAX };
typedef enum OrderActionEnum { Limit=0, Market=1 };
typedef enum OrderTypeEnum { Buy=0, Sell=1, Write=2 };
typedef enum OrderStatusEnum { Sent=0, PendingRecieved=1, Recieved, Excuted, PartlyExecuted, Cancelled };

typedef struct Order_
{
	int OrderID;
	int Exchange;
	int SendTime;
	int SendDate;
	int OrderStatus;
	int OrderType;			// Market / Limit etc
	int Action;				// Buy / Sell
	int Symbol;
	int SymbolIndex;
	int Price;
	int Devider;			// real price = Price / Devider
	int Volume;
	int FillTime;
	int FillDate;
	int FillVolume;
	int FillPrice;
	
	int CancelTime;

	char ErrorMessage[128];

}Order;

typedef struct Product_
{
	// Input Params
	char	ProductName[128];
	double	Capital;				//Sum of First buy and all sells
	double	ProtectionRatio;
	double	ProtectedCapital;
	int		StockIndexType;			// May be changed to array
	int		BaseCurrency;			
	int		DerCurrency;
	int		ProtectionType;			
	bool	ExcatTime;
	double	RequiredTimeToExpire;		// in Month
	double	CurrencyRatioAtEnter;

	// Market Params
	double	CurrencyRatio;
	double	StockIndexValue;
	double	MarketValue;

	// Other Params
	double	MaxSpotMinusIP;
	
	//  (Output)
	int		DerTypes;			// should be part of an array
	int		NumOfDerNotes;		// should be part of an array
	double	DerStrike;			// should be part of an array
	int		DerExpireDate;		// should be part of an array
	double	DerPriceAtEnter;	// should be part of an array
	

	int		BondType;			// should be part of an array
	int		NumOfBonds;			// should be part of an array
	double	BondPriceAtEnter;	// should be part of an array

	double	ReferenceYield;
	double	TimeToExpire;		// in months
}Product;


typedef struct Position_
{
	int	VestingPeriod;

	// Product will hold all the relevant data for the user
	Product Product;

	//char PositionName[128];
	
	int EnterDateInt;
	int EnterTimeInt;
	int MatuirityDateInt;
	int MatuirityTimeInt;
	double MarketValue;

	// Asset1 (Fix)
	//char	BaseAsset1Name[128];
	double	Asset1MarketValue;
	double	Asset1ExecutedPriceEnter;
	double	Asset1ExecutedPriceExit;

	// Asset2 (Der)
	//char	BaseAsset2Name[128];
	double	Asset2MarketValue;
	double	Asset2ExecutedPriceEnter;
	double	Asset2ExecutedPriceExit;

	int ExecutionStatus;

} Position;


typedef struct ShadowProduct_			//all double - int are with factor 100 unless defined otherwise
{
	int		Capital;
	int		ProtectionRatio;			// x 10,000
	int		ProtectedCapital;
	int		StockIndexType;
	int		BaseCurrency;
	int		DerCurrency;
	int		ProtectionType;
	int		ExcatTime;
	int		RequiredTimeToExpire;		
	int		CurrencyRatioAtEnter;		// x 10,000

	// Market Params
	int		CurrencyRatio;				// x 10,000
	int		StockIndexValue;
	int		MarketValue;

	// Other Params
	int		MaxSpotMinusIP;
	
	//  (Output)
	int		DerTypes;
	int		NumOfDerNotes;
	int		DerStrike;
	int     DerExpireDate;
	int		DerPriceAtEnter;
	int		BondType;
	int		NumOfBonds;			
	int		BondPriceAtEnter;	
	int		ReferenceYield;				// x 10,000
	int		TimeToExpire;				
	int		Filler1;					// Struct have to be Data64 aligned

	char	ProductName[128];
} ShadowProduct;


typedef struct ShadowPosition_
{
	int	VestingPeriod;

	//char PositionName[128];
	int EnterDateInt;
	int EnterTimeInt;
	int MatuirityDateInt;
	int MatuirityTimeInt;
	int MarketValue;

	// Asset1 (Fix)
	//char	BaseAsset1Name[128];
	int	Asset1MarketValue;
	int	Asset1ExecutedPriceEnter;
	int	Asset1ExecutedPriceExit;

	// Asset2 (Der)
	//char	BaseAsset2Name[128];
	int	Asset2MarketValue;
	int	Asset2ExecutedPriceEnter;
	int	Asset2ExecutedPriceExit;

	int ExecutionStatus;

	int	Filler1;

	ShadowProduct Product;

}ShadowPosition;


typedef struct SimulationData_
{
	// Input
	double	CurrencyRatio;
	double	TimeToExpire;
	double	SimulatedYield;			// At simulated date. in precentage
	//double	Capital;
	//double	ProtectedCapital;

	// Output
	double	Yield;
	double	CashOut;
	double	TotalYield;				// CashOut / Capital

}SimulationData;


typedef struct Fund_
{
	double	Amount;
	SYSTEMTIME FundDateTime;
} Fund;
